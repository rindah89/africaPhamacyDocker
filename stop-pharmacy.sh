#!/bin/bash
# Stop Africa Pharmacy services

echo "Stopping Africa Pharmacy services..."

# Stop MongoDB
docker-compose -f docker-compose-mongodb.yml down

echo "All services stopped."