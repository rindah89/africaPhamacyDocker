# MongoDB MCP Server

This MCP server provides direct MongoDB database access for Claude, allowing it to query, insert, update, and delete documents in your MongoDB collections.

## Setup

1. Install dependencies:
```bash
cd mcp-servers/mongodb
npm install
```

2. Build the TypeScript code:
```bash
npm run build
```

3. Configure Claude to use this MCP server by adding to your Claude configuration file (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "mongodb": {
      "command": "node",
      "args": ["/path/to/AfricaPharmacy/mcp-servers/mongodb/dist/index.js"],
      "env": {
        "DATABASE_URL": "your-mongodb-connection-string"
      }
    }
  }
}
```

## Available Tools

- **mongodb_query**: Query documents from a collection with filtering, sorting, and pagination
- **mongodb_insert**: Insert new documents into a collection
- **mongodb_update**: Update existing documents with filter criteria
- **mongodb_delete**: Delete documents matching filter criteria
- **mongodb_aggregate**: Run aggregation pipelines for complex queries
- **mongodb_list_collections**: List all collections in the database

## Example Usage

Once configured, Claude can use these tools to interact with your MongoDB database:

```
Query all products:
mongodb_query { "collection": "Product" }

Query products with filter:
mongodb_query { 
  "collection": "Product", 
  "filter": { "status": true },
  "options": { "limit": 10 }
}

Insert a new category:
mongodb_insert {
  "collection": "Category",
  "document": {
    "title": "New Category",
    "slug": "new-category",
    "status": true
  }
}
```

## Security Note

This MCP server has full read/write access to your MongoDB database. Only use it in development environments or ensure proper access controls are in place.