import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError, } from "@modelcontextprotocol/sdk/types.js";
import { MongoClient } from "mongodb";
import { z } from "zod";
const QueryArgsSchema = z.object({
    collection: z.string(),
    filter: z.record(z.any()).optional(),
    options: z.object({
        limit: z.number().optional(),
        skip: z.number().optional(),
        sort: z.record(z.union([z.literal(1), z.literal(-1)])).optional(),
    }).optional(),
});
const InsertArgsSchema = z.object({
    collection: z.string(),
    document: z.record(z.any()),
});
const UpdateArgsSchema = z.object({
    collection: z.string(),
    filter: z.record(z.any()),
    update: z.record(z.any()),
    options: z.object({
        upsert: z.boolean().optional(),
    }).optional(),
});
const DeleteArgsSchema = z.object({
    collection: z.string(),
    filter: z.record(z.any()),
});
const AggregateArgsSchema = z.object({
    collection: z.string(),
    pipeline: z.array(z.record(z.any())),
});
class MongoDBMCPServer {
    server;
    client = null;
    db = null;
    constructor() {
        this.server = new Server({
            name: "mongodb-mcp-server",
            version: "1.0.0",
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupToolHandlers();
        this.server.onerror = (error) => console.error("[MCP Error]", error);
        process.on("SIGINT", async () => {
            await this.cleanup();
            process.exit(0);
        });
    }
    async cleanup() {
        if (this.client) {
            await this.client.close();
        }
    }
    async connectToDatabase() {
        if (this.db)
            return this.db;
        const connectionString = process.env.MONGODB_URI || process.env.DATABASE_URL;
        if (!connectionString) {
            throw new McpError(ErrorCode.InternalError, "MongoDB connection string not found in environment variables");
        }
        try {
            this.client = new MongoClient(connectionString);
            await this.client.connect();
            const dbName = new URL(connectionString).pathname.slice(1);
            this.db = this.client.db(dbName);
            return this.db;
        }
        catch (error) {
            throw new McpError(ErrorCode.InternalError, `Failed to connect to MongoDB: ${error}`);
        }
    }
    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "mongodb_query",
                    description: "Query documents from a MongoDB collection",
                    inputSchema: {
                        type: "object",
                        properties: {
                            collection: { type: "string", description: "Collection name" },
                            filter: { type: "object", description: "MongoDB filter object" },
                            options: {
                                type: "object",
                                properties: {
                                    limit: { type: "number", description: "Limit number of results" },
                                    skip: { type: "number", description: "Skip number of results" },
                                    sort: { type: "object", description: "Sort criteria" },
                                },
                            },
                        },
                        required: ["collection"],
                    },
                },
                {
                    name: "mongodb_insert",
                    description: "Insert a document into a MongoDB collection",
                    inputSchema: {
                        type: "object",
                        properties: {
                            collection: { type: "string", description: "Collection name" },
                            document: { type: "object", description: "Document to insert" },
                        },
                        required: ["collection", "document"],
                    },
                },
                {
                    name: "mongodb_update",
                    description: "Update documents in a MongoDB collection",
                    inputSchema: {
                        type: "object",
                        properties: {
                            collection: { type: "string", description: "Collection name" },
                            filter: { type: "object", description: "Filter for documents to update" },
                            update: { type: "object", description: "Update operations" },
                            options: {
                                type: "object",
                                properties: {
                                    upsert: { type: "boolean", description: "Create if not exists" },
                                },
                            },
                        },
                        required: ["collection", "filter", "update"],
                    },
                },
                {
                    name: "mongodb_delete",
                    description: "Delete documents from a MongoDB collection",
                    inputSchema: {
                        type: "object",
                        properties: {
                            collection: { type: "string", description: "Collection name" },
                            filter: { type: "object", description: "Filter for documents to delete" },
                        },
                        required: ["collection", "filter"],
                    },
                },
                {
                    name: "mongodb_aggregate",
                    description: "Run an aggregation pipeline on a MongoDB collection",
                    inputSchema: {
                        type: "object",
                        properties: {
                            collection: { type: "string", description: "Collection name" },
                            pipeline: { type: "array", description: "Aggregation pipeline stages" },
                        },
                        required: ["collection", "pipeline"],
                    },
                },
                {
                    name: "mongodb_list_collections",
                    description: "List all collections in the database",
                    inputSchema: {
                        type: "object",
                        properties: {},
                    },
                },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const db = await this.connectToDatabase();
            switch (request.params.name) {
                case "mongodb_query": {
                    const args = QueryArgsSchema.parse(request.params.arguments);
                    const collection = db.collection(args.collection);
                    let query = collection.find(args.filter || {});
                    if (args.options?.limit) {
                        query = query.limit(args.options.limit);
                    }
                    if (args.options?.skip) {
                        query = query.skip(args.options.skip);
                    }
                    if (args.options?.sort) {
                        query = query.sort(args.options.sort);
                    }
                    const results = await query.toArray();
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2),
                            },
                        ],
                    };
                }
                case "mongodb_insert": {
                    const args = InsertArgsSchema.parse(request.params.arguments);
                    const collection = db.collection(args.collection);
                    const result = await collection.insertOne(args.document);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    inserted: true,
                                    insertedId: result.insertedId,
                                }, null, 2),
                            },
                        ],
                    };
                }
                case "mongodb_update": {
                    const args = UpdateArgsSchema.parse(request.params.arguments);
                    const collection = db.collection(args.collection);
                    const result = await collection.updateMany(args.filter, args.update, args.options);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    matchedCount: result.matchedCount,
                                    modifiedCount: result.modifiedCount,
                                    upsertedCount: result.upsertedCount,
                                    upsertedId: result.upsertedId,
                                }, null, 2),
                            },
                        ],
                    };
                }
                case "mongodb_delete": {
                    const args = DeleteArgsSchema.parse(request.params.arguments);
                    const collection = db.collection(args.collection);
                    const result = await collection.deleteMany(args.filter);
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify({
                                    deletedCount: result.deletedCount,
                                }, null, 2),
                            },
                        ],
                    };
                }
                case "mongodb_aggregate": {
                    const args = AggregateArgsSchema.parse(request.params.arguments);
                    const collection = db.collection(args.collection);
                    const results = await collection.aggregate(args.pipeline).toArray();
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(results, null, 2),
                            },
                        ],
                    };
                }
                case "mongodb_list_collections": {
                    const collections = await db.listCollections().toArray();
                    return {
                        content: [
                            {
                                type: "text",
                                text: JSON.stringify(collections.map(c => c.name), null, 2),
                            },
                        ],
                    };
                }
                default:
                    throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error("MongoDB MCP server running on stdio");
    }
}
const server = new MongoDBMCPServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map