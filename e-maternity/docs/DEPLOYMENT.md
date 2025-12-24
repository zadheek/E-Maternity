# Production Deployment Guide
# E-Maternity Smart Maternal Health Management System

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Setup](#database-setup)
4. [Application Deployment](#application-deployment)
5. [Security Checklist](#security-checklist)
6. [Post-Deployment](#post-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### System Requirements
- **Node.js**: v20.x or higher
- **PostgreSQL**: v14 or higher
- **Docker** (optional): v24.x or higher
- **SSL Certificate**: Required for production HTTPS

### Required Services
1. **Twilio Account** - For SMS notifications
   - Sign up at: https://www.twilio.com/
   - Get: Account SID, Auth Token, Phone Number

2. **Resend Account** - For email notifications
   - Sign up at: https://resend.com/
   - Get: API Key

3. **Google Maps API** - For hospital locator
   - Enable APIs at: https://console.cloud.google.com/
   - Required APIs: Maps JavaScript API, Geocoding API, Places API

---

## Environment Setup

### 1. Copy Environment File
```bash
cp .env.example .env
```

### 2. Generate Secure Secrets
Generate 32-character random strings for secrets:

```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

### 3. Update Environment Variables

**Critical Variables (MUST UPDATE):**
```env
DATABASE_URL="postgresql://user:password@host:5432/e_maternity"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="<generated-32-char-secret>"
JWT_SECRET="<generated-32-char-secret>"
NODE_ENV="production"
```

**External Services:**
```env
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_PHONE_NUMBER="+1234567890"

RESEND_API_KEY="your_resend_api_key"
EMAIL_FROM="noreply@yourdomain.com"

GOOGLE_MAPS_API_KEY="your_google_maps_key"
```

---

## Database Setup

### Option 1: Manual PostgreSQL Setup

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

#### 2. Create Database
```bash
sudo -u postgres psql

CREATE DATABASE e_maternity;
CREATE USER e_maternity_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE e_maternity TO e_maternity_user;
\q
```

#### 3. Run Migrations
```bash
npm run prisma:migrate:deploy
```

#### 4. Seed Database (optional - for initial data)
```bash
npm run prisma:seed
```

### Option 2: Docker PostgreSQL Setup

```bash
docker run -d \
  --name e-maternity-db \
  -e POSTGRES_DB=e_maternity \
  -e POSTGRES_USER=e_maternity_user \
  -e POSTGRES_PASSWORD=secure_password \
  -p 5432:5432 \
  -v e-maternity-data:/var/lib/postgresql/data \
  postgres:16-alpine

# Run migrations
npm run prisma:migrate:deploy
```

---

## Application Deployment

### Method 1: Traditional VPS/Server Deployment

#### 1. Install Dependencies
```bash
npm ci --production
```

#### 2. Build Application
```bash
npm run build
```

#### 3. Start Production Server
```bash
npm start
```

#### 4. Set up Process Manager (PM2)
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "e-maternity" -- start

# Save PM2 configuration
pm2 save

# Set PM2 to start on system boot
pm2 startup
```

#### 5. Configure Nginx Reverse Proxy
Create `/etc/nginx/sites-available/e-maternity`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration
    ssl_certificate /path/to/fullchain.pem;
    ssl_certificate_key /path/to/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # File upload size limit
    client_max_body_size 10M;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/e-maternity /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal test
sudo certbot renew --dry-run
```

### Method 2: Docker Deployment

#### 1. Create Production Dockerfile
See `Dockerfile.prod` (will be created next)

#### 2. Create docker-compose.prod.yml
See `docker-compose.prod.yml` (will be created next)

#### 3. Build and Deploy
```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Security Checklist

### Application Security
- [ ] Updated all secrets (NEXTAUTH_SECRET, JWT_SECRET)
- [ ] Set NODE_ENV=production
- [ ] Enabled HTTPS/SSL
- [ ] Configured CORS for specific domains
- [ ] Removed development dependencies
- [ ] Disabled debug logs in production
- [ ] Set secure cookie settings
- [ ] Implemented rate limiting
- [ ] Configured CSP headers

### Database Security
- [ ] Strong database password (min 16 characters)
- [ ] Database accessible only from application server
- [ ] Regular database backups configured
- [ ] Database connection over SSL/TLS
- [ ] Restricted database user permissions

### Server Security
- [ ] Firewall configured (allow only 80, 443, 22)
- [ ] SSH key authentication (disable password login)
- [ ] Fail2ban installed and configured
- [ ] Automatic security updates enabled
- [ ] Regular security patching schedule
- [ ] Server monitoring configured

### API Keys & Secrets
- [ ] All API keys stored in environment variables
- [ ] API keys not committed to version control
- [ ] Separate keys for production and development
- [ ] API rate limits configured on external services
- [ ] API key rotation plan in place

---

## Post-Deployment

### 1. Health Checks
```bash
# Check application status
curl https://yourdomain.com/api/health

# Check database connection
npm run prisma:db:check

# View logs
pm2 logs e-maternity
# OR
docker-compose -f docker-compose.prod.yml logs -f app
```

### 2. Create Admin User
```bash
# SSH into server
ssh user@yourserver

# Navigate to project directory
cd /path/to/e-maternity

# Run admin creation script
npm run prisma:seed -- --admin-only
```

### 3. Set Up Monitoring

#### Application Monitoring
- Install New Relic, Datadog, or similar APM
- Configure error tracking (Sentry)
- Set up uptime monitoring (UptimeRobot, Pingdom)

#### Database Monitoring
- Enable PostgreSQL slow query log
- Monitor connection pool usage
- Set up disk space alerts

#### Server Monitoring
- CPU and memory usage alerts
- Disk space monitoring
- Network traffic monitoring

### 4. Configure Backups

#### Database Backups
```bash
# Create backup script
cat > /usr/local/bin/backup-e-maternity.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/e-maternity"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

pg_dump -h localhost -U e_maternity_user e_maternity | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-e-maternity.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-e-maternity.sh
```

#### File Uploads Backup
```bash
# Rsync uploads directory
rsync -av /path/to/e-maternity/uploads/ /backups/e-maternity/uploads/
```

### 5. Performance Optimization

#### Database
```sql
-- Create indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_health_metrics_mother_date 
  ON "HealthMetric"("motherId", "recordedAt" DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_provider_date 
  ON "Appointment"("providerId", "scheduledDate");

-- Analyze tables
ANALYZE;
```

#### Application
- Enable Next.js image optimization
- Configure CDN for static assets
- Enable Redis caching (optional)
- Configure database connection pooling

---

## Troubleshooting

### Application Won't Start

**Check logs:**
```bash
pm2 logs e-maternity --lines 100
# OR
docker-compose -f docker-compose.prod.yml logs app
```

**Common issues:**
- Missing environment variables
- Database connection failure
- Port already in use
- Build errors

### Database Connection Errors

**Test connection:**
```bash
psql -h hostname -U username -d e_maternity
```

**Check:**
- DATABASE_URL format is correct
- Database server is running
- Network connectivity
- Firewall rules
- Database user permissions

### 502 Bad Gateway (Nginx)

**Check:**
- Application is running: `pm2 status`
- Correct port in Nginx config
- Firewall allows internal connections
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### High Memory Usage

**Optimize:**
- Review database queries
- Check for memory leaks
- Limit concurrent connections
- Increase server resources

### Slow Performance

**Investigate:**
- Check database query performance
- Enable slow query log
- Review server resources (CPU, RAM, disk)
- Check network latency
- Optimize images and assets

---

## Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor error logs
- Check system health metrics
- Review security alerts

**Weekly:**
- Review database performance
- Check disk space usage
- Review application logs for errors
- Test critical user flows

**Monthly:**
- Security updates and patches
- Database optimization (VACUUM, ANALYZE)
- Review and rotate logs
- Backup verification test
- Performance review

### Emergency Contacts

Document key contacts:
- System Administrator
- Database Administrator  
- DevOps Engineer
- On-call Developer
- External Service Support (Twilio, etc.)

### Rollback Plan

In case of critical issues:

1. **Stop application:**
   ```bash
   pm2 stop e-maternity
   ```

2. **Restore previous version:**
   ```bash
   git checkout <previous-version-tag>
   npm ci
   npm run build
   pm2 restart e-maternity
   ```

3. **Restore database (if needed):**
   ```bash
   # Restore from backup
   gunzip < /backups/e-maternity/backup_YYYYMMDD_HHMMSS.sql.gz | \
     psql -h localhost -U e_maternity_user e_maternity
   ```

---

## Additional Resources

- [Next.js Production Checklist](https://nextjs.org/docs/going-to-production)
- [PostgreSQL Performance Tuning](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Nginx Security Best Practices](https://nginx.org/en/docs/http/request_processing.html)
- [Docker Production Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

**Last Updated:** December 2025  
**Version:** 1.0.0
