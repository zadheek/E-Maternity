# Docker Development Environment Guide

## Overview
This guide covers running the E-Maternity application in development mode with Docker, featuring hot-reload capabilities for rapid development.

## Architecture
- **Development Dockerfile** (`Dockerfile.dev`) - Optimized for development with all dev dependencies
- **Development Compose** (`docker-compose.dev.yml`) - Volume mounts for live code updates
- **File Watching** - Automatic detection and hot-reloading of code changes
- **Separate Database** - Isolated dev database to avoid conflicts with production

## Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Port 3001 and 5432 available

## Quick Start

### 1. Start Development Environment
```bash
# Build and start all services
docker-compose -f docker-compose.dev.yml up -d --build

# View logs
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### 2. Access Application
- **Application**: http://localhost:3001 (Note: port 3001 for dev, 3000 for production)
- **Database**: localhost:5432
- **Hot Reload**: Enabled - changes to code are reflected immediately

## Development Features

### Hot Reload Configuration
File watching is enabled via multiple environment variables:
- `WATCHPACK_POLLING=true` - Webpack polling mode for Docker
- `CHOKIDAR_USEPOLLING=true` - Alternative file watcher

### Volume Mounts
The following directories are mounted for live updates:
```yaml
- ./src              → /app/src           (Source code)
- ./public           → /app/public        (Static assets)
- ./prisma           → /app/prisma        (Database schema)
- ./prisma.config.ts → /app/prisma.config.ts
- ./next.config.ts   → /app/next.config.ts
- ./tailwind.config.ts → /app/tailwind.config.ts
- ./tsconfig.json    → /app/tsconfig.json
- ./.env             → /app/.env          (Environment variables)
```

**Note**: `node_modules` and `.next` are excluded and use container versions.

### Automatic Prisma Updates
When you modify Prisma schema:
1. Update `prisma/schema.prisma` on your host
2. Create migration: `docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev --name your_migration`
3. Changes are automatically reflected in the running container

## Common Commands

### Container Management
```bash
# Start services
docker-compose -f docker-compose.dev.yml up -d

# Start with build (after dependency changes)
docker-compose -f docker-compose.dev.yml up -d --build

# View logs (follow mode)
docker-compose -f docker-compose.dev.yml logs -f

# View app logs only
docker-compose -f docker-compose.dev.yml logs -f app

# Stop services
docker-compose -f docker-compose.dev.yml down

# Stop and remove volumes (⚠️ deletes database)
docker-compose -f docker-compose.dev.yml down -v

# Restart app only
docker-compose -f docker-compose.dev.yml restart app
```

### Database Operations
```bash
# Run Prisma migrations
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev

# Create new migration
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev --name add_new_feature

# Reset database (⚠️ deletes all data)
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate reset

# Open Prisma Studio
docker-compose -f docker-compose.dev.yml exec app npx prisma studio

# Generate Prisma Client (after schema changes)
docker-compose -f docker-compose.dev.yml exec app npx prisma generate

# Access PostgreSQL directly
docker-compose -f docker-compose.dev.yml exec postgres psql -U postgres -d e_maternity
```

### Package Management
```bash
# Install new package (requires rebuild)
npm install <package-name>
docker-compose -f docker-compose.dev.yml up -d --build

# Remove package (requires rebuild)
npm uninstall <package-name>
docker-compose -f docker-compose.dev.yml up -d --build
```

### Shell Access
```bash
# Access app container shell
docker-compose -f docker-compose.dev.yml exec app sh

# Access database container shell
docker-compose -f docker-compose.dev.yml exec postgres sh
```

## Development Workflow

### Making Code Changes
1. Edit files in your local `src/` directory
2. Save the file
3. Next.js automatically detects changes and hot-reloads
4. Refresh browser to see updates (or automatic with Fast Refresh)

### Adding Dependencies
```bash
# Install package locally
npm install <package-name>

# Rebuild container to include new dependency
docker-compose -f docker-compose.dev.yml up -d --build app
```

### Database Schema Changes
```bash
# 1. Modify prisma/schema.prisma locally
# 2. Create and apply migration
docker-compose -f docker-compose.dev.yml exec app npx prisma migrate dev --name your_change

# 3. Generate updated Prisma Client
docker-compose -f docker-compose.dev.yml exec app npx prisma generate

# 4. Restart app if needed
docker-compose -f docker-compose.dev.yml restart app
```

## Troubleshooting

### Hot Reload Not Working
```bash
# Check if WATCHPACK_POLLING is enabled
docker-compose -f docker-compose.dev.yml exec app printenv | grep WATCH

# Restart app container
docker-compose -f docker-compose.dev.yml restart app

# Check logs for file watcher issues
docker-compose -f docker-compose.dev.yml logs -f app | grep -i watch
```

### Port Conflicts
```bash
# Check if ports are in use
netstat -ano | findstr :3001  # Windows
lsof -i :3001                 # Linux/Mac

# Change port in docker-compose.dev.yml
# ports:
#   - '3002:3000'  # Use different host port
```

### Database Connection Issues
```bash
# Check database health
docker-compose -f docker-compose.dev.yml exec postgres pg_isready -U postgres

# Verify DATABASE_URL
docker-compose -f docker-compose.dev.yml exec app printenv DATABASE_URL

# Check database logs
docker-compose -f docker-compose.dev.yml logs postgres
```

### Build Failures
```bash
# Clear Docker cache and rebuild
docker-compose -f docker-compose.dev.yml down
docker builder prune
docker-compose -f docker-compose.dev.yml up -d --build

# Check for node_modules conflicts
rm -rf node_modules package-lock.json
npm install
docker-compose -f docker-compose.dev.yml up -d --build
```

### Container Keeps Restarting
```bash
# Check app logs for errors
docker-compose -f docker-compose.dev.yml logs app

# Check if database is healthy
docker-compose -f docker-compose.dev.yml ps

# Verify environment variables
docker-compose -f docker-compose.dev.yml exec app env
```

### Slow Performance
```bash
# Enable WSL2 backend on Windows for better performance
# Docker Desktop → Settings → General → Use WSL 2 based engine

# Reduce volume mounts by mounting only essential directories
# Comment out unnecessary mounts in docker-compose.dev.yml

# Increase Docker resources
# Docker Desktop → Settings → Resources
```

## Environment Variables

### Development Defaults
```env
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/e_maternity?schema=public
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=dev-secret-change-in-production-min-32-characters-long
JWT_SECRET=dev-jwt-secret-change-in-production-min-32-chars
WATCHPACK_POLLING=true
CHOKIDAR_USEPOLLING=true
```

### Override in .env file
Create `.env` in project root with your custom values:
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/e_maternity?schema=public
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-here
JWT_SECRET=your-jwt-secret-here
```

## Performance Optimization

### Reduce Container Rebuild Time
- Only rebuild when `package.json` changes
- Use layer caching effectively
- Exclude unnecessary files in `.dockerignore`

### File Watching Optimization
- Polling can be CPU-intensive on large projects
- Consider using native file events when supported:
  ```yaml
  # Remove if not needed
  # - WATCHPACK_POLLING=true
  # - CHOKIDAR_USEPOLLING=true
  ```

### Volume Mount Optimization
- Mount only directories you actively edit
- Exclude `node_modules` and `.next` for better performance
- Use named volumes for better I/O performance

## Comparison: Dev vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Port | 3001 | 3000 |
| Hot Reload | ✅ Enabled | ❌ Disabled |
| Volume Mounts | ✅ Source code | ❌ None (built into image) |
| Build Type | Development | Optimized standalone |
| File Watching | ✅ Polling enabled | ❌ Not needed |
| Dependencies | All (dev + prod) | Production only |
| Image Size | ~1.2GB | ~150MB |
| Startup Time | Fast (no build) | Moderate (pre-built) |
| Database Volume | `postgres_data_dev` | `postgres_data` |

## Best Practices

### 1. Keep Dev and Prod Separate
- Use different database volumes
- Use different container names
- Use different ports to run both simultaneously

### 2. Regular Cleanup
```bash
# Remove unused containers
docker-compose -f docker-compose.dev.yml down

# Remove unused images
docker image prune

# Clean build cache
docker builder prune
```

### 3. Version Control
- Commit `Dockerfile.dev` and `docker-compose.dev.yml`
- Do NOT commit `.env` files (add to `.gitignore`)
- Document environment variables in `.env.example`

### 4. Database Management
- Create database backups before major schema changes
- Use migrations instead of manual schema edits
- Test migrations in dev before production

### 5. Dependency Management
- Keep `package.json` in sync between host and container
- Rebuild after dependency changes
- Use exact versions in production

## Switching Between Dev and Production

### Start Development
```bash
# Stop production if running
docker-compose down

# Start development
docker-compose -f docker-compose.dev.yml up -d --build

# Access at http://localhost:3001
```

### Start Production
```bash
# Stop development if running
docker-compose -f docker-compose.dev.yml down

# Start production
docker-compose up -d --build

# Access at http://localhost:3000
```

### Run Both Simultaneously
Since they use different ports and volumes, you can run both:
```bash
# Start production (port 3000)
docker-compose up -d

# Start development (port 3001)
docker-compose -f docker-compose.dev.yml up -d
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Development Docker Build

on:
  push:
    branches: [develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build dev container
        run: docker-compose -f docker-compose.dev.yml build
      
      - name: Start services
        run: docker-compose -f docker-compose.dev.yml up -d
      
      - name: Wait for app to be ready
        run: sleep 30
      
      - name: Run tests
        run: docker-compose -f docker-compose.dev.yml exec -T app npm test
      
      - name: Cleanup
        run: docker-compose -f docker-compose.dev.yml down -v
```

## Support
For issues or questions:
1. Check logs: `docker-compose -f docker-compose.dev.yml logs -f`
2. Review documentation: `/docs/DOCKER.md` for production setup
3. Verify environment variables in `.env` file
4. Ensure Docker and Docker Compose are up to date
