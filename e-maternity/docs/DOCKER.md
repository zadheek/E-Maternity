# Docker Deployment Guide

## Overview
The E-Maternity application is fully containerized using Docker and Docker Compose. This guide covers building, running, and deploying the application in Docker containers.

## Architecture
- **Multi-stage Docker build** for optimized image size
- **PostgreSQL container** for database
- **Next.js container** for the application
- **Docker network** for inter-container communication
- **Volume persistence** for database data

## Prerequisites
- Docker 20.10+
- Docker Compose 2.0+

## Quick Start

### 1. Production Build & Run
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### 2. Access Application
- **Application**: http://localhost:3000
- **Database**: localhost:5432

## Docker Files

### Dockerfile (Multi-Stage Build)
```dockerfile
# Stage 1: Dependencies - Install node modules
# Stage 2: Builder - Build Next.js application with Prisma
# Stage 3: Runner - Production runtime with minimal footprint
```

**Benefits:**
- Optimized layer caching
- Smaller final image (~150MB vs ~1GB)
- Security hardened with non-root user
- Only production dependencies

### docker-compose.yml
```yaml
services:
  postgres:
    - PostgreSQL 16 Alpine
    - Health checks enabled
    - Persistent volume storage
  
  app:
    - Next.js application
    - Auto-runs Prisma migrations on startup
    - Depends on healthy database
    - Environment variables configured
```

### .dockerignore
Excludes:
- node_modules (rebuilt in Docker)
- .next build cache
- Development files
- IDE configurations

## Environment Configuration

### Development (.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/e_maternity?schema=public"
NEXTAUTH_URL="http://localhost:3001"
```

### Production (.env.production)
```env
DATABASE_URL="postgresql://postgres:postgres@postgres:5432/e_maternity?schema=public"
NEXTAUTH_URL="http://localhost:3000"
```

**⚠️ IMPORTANT**: Change these secrets in production:
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`

## Common Commands

### Building
```bash
# Build specific service
docker-compose build app

# Build with no cache (force rebuild)
docker-compose build --no-cache
```

### Running
```bash
# Start in foreground (see logs)
docker-compose up

# Start in background (detached)
docker-compose up -d

# Start specific service
docker-compose up -d postgres
```

### Logs
```bash
# View all logs
docker-compose logs

# Follow logs (tail -f)
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
```

### Database Management
```bash
# Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# Access Prisma Studio
docker-compose exec app npx prisma studio

# Direct PostgreSQL access
docker-compose exec postgres psql -U postgres -d e_maternity
```

### Cleanup
```bash
# Stop containers
docker-compose stop

# Remove containers
docker-compose down

# Remove containers and volumes (⚠️ deletes data)
docker-compose down -v

# Remove images
docker rmi e-maternity-app postgres:16-alpine
```

## Troubleshooting

### Container won't start
```bash
# Check container status
docker-compose ps

# View logs for errors
docker-compose logs app
docker-compose logs postgres

# Check if port is in use
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac
```

### Database connection issues
```bash
# Check database health
docker-compose exec postgres pg_isready -U postgres

# Verify DATABASE_URL in app
docker-compose exec app printenv DATABASE_URL

# Restart with fresh database
docker-compose down -v
docker-compose up -d
```

### Prisma migration errors
```bash
# Reset database and apply migrations
docker-compose exec app npx prisma migrate reset --force

# Generate Prisma client
docker-compose exec app npx prisma generate

# Apply pending migrations
docker-compose exec app npx prisma migrate deploy
```

### Build failures
```bash
# Clear build cache
docker builder prune

# Rebuild without cache
docker-compose build --no-cache --pull

# Check Dockerfile syntax
docker build --check .
```

### Image size too large
```bash
# Check image sizes
docker images

# Expected sizes:
# - e-maternity-app: ~150-200MB
# - postgres:16-alpine: ~230MB

# If too large, check .dockerignore is working
docker build --no-cache .
```

## Production Deployment

### Security Checklist
- [ ] Change `NEXTAUTH_SECRET` to random 32+ char string
- [ ] Change `JWT_SECRET` to random 32+ char string
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Use strong `POSTGRES_PASSWORD`
- [ ] Enable HTTPS/TLS
- [ ] Configure firewall rules
- [ ] Set up backup strategy for postgres_data volume
- [ ] Enable container resource limits
- [ ] Implement log rotation
- [ ] Set up monitoring (health checks, metrics)

### Resource Limits (Add to docker-compose.yml)
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '1'
          memory: 512M
  
  postgres:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 256M
```

### Backup Strategy
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres e_maternity > backup_$(date +%Y%m%d).sql

# Restore database
docker-compose exec -T postgres psql -U postgres e_maternity < backup_20250122.sql

# Backup volume
docker run --rm -v e-maternity_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz /data
```

## Performance Optimization

### Image Optimization
- Using Alpine Linux base (smaller footprint)
- Multi-stage build (only production files)
- Layer caching for faster rebuilds
- Standalone Next.js output

### Runtime Optimization
- Health checks for reliability
- Restart policies for availability
- Network isolation for security
- Volume mounts for persistence

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Docker Build & Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker image
        run: docker-compose build
      
      - name: Run tests
        run: docker-compose run app npm test
      
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

## Monitoring

### Health Checks
```bash
# Check application health
curl http://localhost:3000/api/health

# Check database health
docker-compose exec postgres pg_isready -U postgres
```

### Resource Usage
```bash
# Container stats (CPU, Memory)
docker stats

# Disk usage
docker system df
```

## Support
For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review documentation: `/docs/README-Development.md`
3. Verify environment variables in `.env.production`
4. Ensure Docker and Docker Compose are up to date
