#!/bin/bash
# Initialize MongoDB replica set

echo "Starting MongoDB containers..."
docker-compose up -d mongodb

echo "Waiting for MongoDB to be ready..."
sleep 15

echo "Initializing replica set..."
docker-compose exec -T mongodb mongosh --eval '
try {
  rs.status();
  print("Replica set already initialized");
} catch (e) {
  print("Initializing new replica set...");
  rs.initiate({
    _id: "rs0",
    members: [
      { _id: 0, host: "localhost:27017", priority: 1 }
    ]
  });
  print("Replica set initialized!");
}
'

echo "Waiting for replica set to be ready..."
sleep 5

echo "Starting other services..."
docker-compose up -d

echo "MongoDB replica set setup complete!"