# Docker Setup Guide for Africa Pharmacy

This guide explains how to run Africa Pharmacy locally using Docker with MongoDB.

## Prerequisites

- Docker Desktop installed on your machine
- Docker Compose (usually comes with Docker Desktop)
- At least 4GB of available RAM for Docker

## Quick Start

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <your-repo-url>
   cd AfricaPharmacy
   ```

2. **Create environment file**
   ```bash
   cp .env.docker.example .env
   ```

3. **Generate NextAuth secret**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and update `NEXTAUTH_SECRET` in your `.env` file

4. **Build and start the services**
   ```bash
   npm run docker:build
   npm run docker:up
   ```

5. **Run database migrations** (first time only)
   ```bash
   docker-compose exec app npx prisma migrate deploy
   ```

6. **Seed the database** (optional)
   ```bash
   npm run docker:seed
   ```

7. **Access the application**
   - Application: http://localhost:3000
   - MongoDB Express (Database UI): http://localhost:8081

## Docker Commands

The following npm scripts are available for Docker management:

- `npm run docker:build` - Build the Docker images
- `npm run docker:up` - Start all services in detached mode
- `npm run docker:down` - Stop all services
- `npm run docker:logs` - View logs from all services
- `npm run docker:reset` - Reset everything (removes volumes/data)
- `npm run docker:seed` - Seed the database with sample data

## Environment Variables

Key environment variables for Docker setup:

- `MONGO_ROOT_USERNAME` - MongoDB root username (default: admin)
- `MONGO_ROOT_PASSWORD` - MongoDB root password (default: password123)
- `MONGO_DATABASE` - Database name (default: africapharmacy)
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (generate with openssl)
- `NEXTAUTH_URL` - Application URL (default: http://localhost:3000)
- `NEXT_PUBLIC_USE_LOCAL_STORAGE` - Enable local file storage for images (default: true)

## Image Uploads

In the Docker environment, images are stored locally in the `/app/public/uploads` directory. This directory is mounted as a volume, so uploaded images persist even when containers are restarted.

The application automatically uses local storage when `NEXT_PUBLIC_USE_LOCAL_STORAGE=true` is set. Images are accessible at `http://localhost:3000/uploads/images/[filename]`.

## Troubleshooting

### Port conflicts
If you get port conflict errors:
```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 27017 (MongoDB)
lsof -i :27017
```

### Database connection issues
If the app can't connect to MongoDB:
1. Check if MongoDB is running: `docker-compose ps`
2. Check MongoDB logs: `docker-compose logs mongodb`
3. Verify DATABASE_URL in the app service logs

### Build failures
If the build fails:
1. Clear Docker cache: `docker system prune -a`
2. Rebuild without cache: `docker-compose build --no-cache`

### Permission issues
If you encounter permission issues with uploads:
```bash
# Fix upload directory permissions
docker-compose exec app chown -R nextjs:nodejs /app/public/uploads
```

## Development Workflow

1. **Making code changes**
   - Code changes require rebuilding the Docker image
   - Run `docker-compose up --build` to rebuild and restart

2. **Database changes**
   - After modifying Prisma schema, run:
   ```bash
   docker-compose exec app npx prisma migrate dev
   ```

3. **Viewing logs**
   ```bash
   # All services
   npm run docker:logs
   
   # Specific service
   docker-compose logs -f app
   docker-compose logs -f mongodb
   ```

## Production Considerations

For production deployment:

1. Use strong passwords for MongoDB
2. Enable MongoDB authentication
3. Use proper SSL certificates
4. Set up proper backup strategies
5. Use environment-specific .env files
6. Consider using managed MongoDB services

## Cleanup

To completely remove all Docker resources:
```bash
# Stop and remove containers, networks, volumes
npm run docker:reset

# Remove images as well
docker-compose down --rmi all
```