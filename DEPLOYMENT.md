# Deployment Guide

## Production Deployment Checklist

### 1. Security Configuration

#### Update Environment Variables
Edit `.env` file with production values:

```bash
# Strong database password (min 20 characters)
POSTGRES_PASSWORD=your_very_secure_database_password_here

# Strong Redis password (min 20 characters)
REDIS_PASSWORD=your_very_secure_redis_password_here

# JWT Secret (min 32 characters, random string)
JWT_SECRET=your_super_secret_jwt_key_must_be_at_least_32_characters_long

# Production mode
NODE_ENV=production

# Increase bcrypt rounds for production
BCRYPT_ROUNDS=12

# API rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Change Default Admin Password
1. Login with default credentials (admin/Admin123!)
2. Navigate to profile settings
3. Change password immediately
4. Use strong password (min 12 characters, mixed case, numbers, symbols)

### 2. SSL/TLS Configuration

#### Using Let's Encrypt with Certbot

1. Install Certbot:
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. Stop nginx container:
```bash
docker-compose stop nginx
```

3. Obtain certificate:
```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

4. Update nginx configuration (`nginx/conf.d/default.conf`):

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # ... rest of configuration
}
```

5. Update docker-compose.yml to mount certificates:
```yaml
nginx:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 3. Database Security

#### PostgreSQL Configuration

1. Change default port (optional):
```yaml
postgres:
  ports:
    - "5433:5432"  # Use non-standard port
```

2. Limit network access:
```yaml
postgres:
  networks:
    - forum_network
  # Remove ports section to prevent external access
```

3. Enable SSL connections:
Add to docker-compose.yml:
```yaml
postgres:
  command: postgres -c ssl=on -c ssl_cert_file=/etc/ssl/certs/server.crt -c ssl_key_file=/etc/ssl/private/server.key
```

#### Database Backups

Automated backup script (`backup.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec forum_postgres pg_dump -U forum_user forum_db | gzip > $BACKUP_DIR/forum_backup_$DATE.sql.gz
find $BACKUP_DIR -name "forum_backup_*.sql.gz" -mtime +7 -delete
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

### 4. Redis Security

1. Use strong password (already configured in .env)
2. Disable dangerous commands:

Update docker-compose.yml:
```yaml
redis:
  command: redis-server --requirepass ${REDIS_PASSWORD} --rename-command FLUSHDB "" --rename-command FLUSHALL "" --rename-command CONFIG ""
```

### 5. Application Security

#### Rate Limiting

Adjust in `.env` based on your traffic:
```bash
# Stricter limits for production
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=50   # 50 requests per window
```

#### Content Security Policy

Add to `nginx/conf.d/default.conf`:
```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### 6. Monitoring and Logging

#### Application Logs

View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

#### Log Rotation

Create `/etc/docker/daemon.json`:
```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

#### Health Monitoring

Check health status:
```bash
docker-compose ps
curl http://localhost:3000/health
```

### 7. Performance Optimization

#### Database Optimization

1. Add indexes (already included in init.sql)
2. Tune PostgreSQL configuration:

Create `postgres.conf`:
```
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
max_connections = 100
```

3. Regular VACUUM:
```sql
-- Run periodically
VACUUM ANALYZE;
```

#### Redis Configuration

Optimize Redis:
```yaml
redis:
  command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 256mb --maxmemory-policy allkeys-lru
```

#### Nginx Tuning

Update `nginx/nginx.conf`:
```nginx
worker_processes auto;
worker_connections 2048;

# Enable caching
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
```

### 8. Firewall Configuration

#### UFW (Ubuntu)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

### 9. Container Updates

Update images:
```bash
docker-compose pull
docker-compose up -d
```

### 10. Scaling

#### Horizontal Scaling

1. Use Docker Swarm or Kubernetes
2. Add load balancer
3. Use external Redis and PostgreSQL
4. Implement session sharing

Example with Docker Swarm:
```bash
docker swarm init
docker stack deploy -c docker-compose.yml forum
docker service scale forum_backend=3
```

## Troubleshooting Production Issues

### High Memory Usage

Check container stats:
```bash
docker stats
```

Limit container memory:
```yaml
backend:
  deploy:
    resources:
      limits:
        memory: 512M
```

### Database Connection Issues

1. Check connection limit:
```sql
SELECT * FROM pg_stat_activity;
```

2. Increase max_connections in PostgreSQL

### Slow Response Times

1. Enable query logging:
```yaml
postgres:
  command: postgres -c log_statement=all -c log_duration=on
```

2. Analyze slow queries:
```sql
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

## Maintenance Tasks

### Daily
- Monitor logs for errors
- Check disk space
- Verify backups

### Weekly
- Review user activity
- Check for suspicious patterns
- Update security patches

### Monthly
- Update dependencies
- Review and optimize database
- Audit user permissions
- Review and rotate logs

## Emergency Procedures

### Restore from Backup

```bash
# Stop containers
docker-compose down

# Restore database
gunzip -c backup.sql.gz | docker exec -i forum_postgres psql -U forum_user -d forum_db

# Restart containers
docker-compose up -d
```

### Rollback Deployment

```bash
# Stop current version
docker-compose down

# Checkout previous version
git checkout <previous-commit>

# Deploy
docker-compose up -d --build
```

## Support

For production support and questions:
1. Check logs first
2. Review this guide
3. Search existing issues
4. Open new issue with logs and details
