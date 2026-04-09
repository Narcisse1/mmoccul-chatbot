# MMOCCUL WhatsApp-Style Chatbot - Deployment Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [System Requirements](#system-requirements)
3. [Local Development Setup](#local-development-setup)
4. [Database Configuration](#database-configuration)
5. [Environment Variables](#environment-variables)
6. [Running the Application](#running-the-application)
7. [Deployment Options](#deployment-options)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- MySQL 8.0+ or compatible database
- Git

### 5-Minute Setup
```bash
# 1. Clone or extract the project
cd mmoccul-chatbot

# 2. Install dependencies
pnpm install

# 3. Set up environment variables (see Environment Variables section)
cp .env.example .env.local

# 4. Set up database
pnpm drizzle-kit push

# 5. Start development server
pnpm dev

# 6. Open browser to http://localhost:3000
```

---

## 💻 System Requirements

### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 2GB
- **Storage**: 5GB
- **Node.js**: v18.0.0 or higher
- **npm/pnpm**: v8.0.0 or higher

### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 4GB+
- **Storage**: 20GB
- **Node.js**: v20.0.0 or higher
- **Database**: MySQL 8.0+ or TiDB

---

## 🔧 Local Development Setup

### Step 1: Install Node.js and pnpm

**macOS (using Homebrew)**
```bash
brew install node
npm install -g pnpm
```

**Ubuntu/Debian**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
```

**Windows**
- Download from [nodejs.org](https://nodejs.org)
- Install Node.js (includes npm)
- Run: `npm install -g pnpm`

### Step 2: Clone the Repository
```bash
git clone <repository-url>
cd mmoccul-chatbot
```

### Step 3: Install Dependencies
```bash
pnpm install
```

### Step 4: Set Up Environment Variables
Create a `.env.local` file in the project root:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/mmoccul_chatbot

# Authentication (get from Manus dashboard)
JWT_SECRET=your_jwt_secret_here
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# LLM Integration
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_forge_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_forge_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge

# Owner Information
OWNER_NAME=MMOCCUL
OWNER_OPEN_ID=your_owner_open_id

# Application Settings
VITE_APP_TITLE=MMOCCUL Support
VITE_APP_LOGO=https://your-logo-url.png

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=https://analytics.example.com
VITE_ANALYTICS_WEBSITE_ID=your_website_id
```

---

## 🗄️ Database Configuration

### MySQL Setup

**Local MySQL Installation**

macOS:
```bash
brew install mysql
brew services start mysql
mysql -u root -p
```

Ubuntu/Debian:
```bash
sudo apt-get install mysql-server
sudo mysql_secure_installation
sudo systemctl start mysql
mysql -u root -p
```

**Create Database**
```sql
CREATE DATABASE mmoccul_chatbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mmoccul_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON mmoccul_chatbot.* TO 'mmoccul_user'@'localhost';
FLUSH PRIVILEGES;
```

**Update .env.local**
```env
DATABASE_URL=mysql://mmoccul_user:secure_password@localhost:3306/mmoccul_chatbot
```

### Cloud Database Options

**AWS RDS**
```env
DATABASE_URL=mysql://user:password@your-rds-endpoint.amazonaws.com:3306/mmoccul_chatbot
```

**Google Cloud SQL**
```env
DATABASE_URL=mysql://user:password@your-cloudsql-endpoint:3306/mmoccul_chatbot
```

**TiDB Cloud**
```env
DATABASE_URL=mysql://user:password@your-tidb-endpoint:4000/mmoccul_chatbot
```

---

## 🔐 Environment Variables

### Required Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Database connection string | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | Secret for session tokens | Generate with: `openssl rand -base64 32` |
| `VITE_APP_ID` | Manus OAuth app ID | From Manus dashboard |
| `BUILT_IN_FORGE_API_KEY` | LLM API key | From Manus dashboard |

### Optional Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_APP_TITLE` | Chatbot title | "MMOCCUL Support" |
| `VITE_APP_LOGO` | Logo URL | MMOCCUL logo |
| `NODE_ENV` | Environment | "development" |
| `PORT` | Server port | 3000 |

### Generate Secure Secrets
```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate API keys
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## ▶️ Running the Application

### Development Mode
```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm drizzle-kit push

# Start dev server (with hot reload)
pnpm dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

### Running Tests
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run specific test file
pnpm test server/chat.test.ts
```

### Database Migrations
```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply migrations
pnpm drizzle-kit migrate

# Push schema to database
pnpm drizzle-kit push
```

---

## 🌐 Deployment Options

### Option 1: Deploy on Manus Platform (Recommended)

The chatbot is built on Manus and includes built-in hosting. To deploy:

1. **Create a Checkpoint** (already done)
2. **Click Publish Button** in the Management UI
3. **Configure Domain**:
   - Use auto-generated domain: `your-app.manus.space`
   - Or bind custom domain in Settings > Domains
4. **Enable SSL** (automatic)

**Manus Deployment Benefits:**
- ✅ Automatic SSL/HTTPS
- ✅ Global CDN
- ✅ Auto-scaling
- ✅ Built-in monitoring
- ✅ Database included
- ✅ LLM integration included

### Option 2: Deploy on Railway

**Prerequisites:**
- Railway account (railway.app)
- GitHub repository

**Steps:**
1. Push code to GitHub
2. Connect GitHub to Railway
3. Create new project from GitHub
4. Add environment variables:
   ```
   DATABASE_URL=mysql://...
   JWT_SECRET=...
   NODE_ENV=production
   ```
5. Deploy

**Railway Configuration:**
```yaml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "pnpm start"
```

### Option 3: Deploy on Render

**Steps:**
1. Connect GitHub repository
2. Create new Web Service
3. Set build command: `pnpm install && pnpm build`
4. Set start command: `pnpm start`
5. Add environment variables
6. Deploy

### Option 4: Deploy on Vercel (Frontend Only)

**Note:** Vercel is for static/serverless. Use with external backend.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 5: Docker Deployment

**Create Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

**Build and Run:**
```bash
docker build -t mmoccul-chatbot .
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_SECRET="..." \
  mmoccul-chatbot
```

**Docker Compose:**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: mysql://user:password@db:3306/mmoccul_chatbot
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: mmoccul_chatbot
      MYSQL_USER: mmoccul_user
      MYSQL_PASSWORD: user_password
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

Run with: `docker-compose up`

### Option 6: Traditional VPS (AWS EC2, DigitalOcean, Linode)

**Ubuntu/Debian Setup:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Install MySQL
sudo apt-get install -y mysql-server

# Install Nginx (reverse proxy)
sudo apt-get install -y nginx

# Install PM2 (process manager)
npm install -g pm2

# Clone repository
git clone <repo-url>
cd mmoccul-chatbot

# Install dependencies
pnpm install

# Build application
pnpm build

# Start with PM2
pm2 start "pnpm start" --name "mmoccul-chatbot"
pm2 save
pm2 startup
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable SSL with Let's Encrypt:
```bash
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 📊 Performance Optimization

### Database Optimization
```sql
-- Create indexes for faster queries
CREATE INDEX idx_conversation_user ON conversations(userId);
CREATE INDEX idx_message_conversation ON messages(conversationId);
CREATE INDEX idx_message_created ON messages(createdAt);
```

### Caching Strategy
```typescript
// Enable Redis caching (optional)
// Add to .env.local
REDIS_URL=redis://localhost:6379
```

### CDN Configuration
- Use Cloudflare for DNS and caching
- Configure cache rules for static assets
- Enable compression (gzip/brotli)

---

## 🔍 Monitoring & Logging

### Application Logs
```bash
# View PM2 logs
pm2 logs mmoccul-chatbot

# View Docker logs
docker logs <container-id>

# View application logs
tail -f .manus-logs/devserver.log
```

### Database Monitoring
```sql
-- Check active connections
SHOW PROCESSLIST;

-- Monitor slow queries
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
```

### Health Check
```bash
# Test API health
curl http://localhost:3000/api/health

# Check database connection
pnpm test
```

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed

**Solution:**
```bash
# Check database is running
mysql -u root -p

# Verify connection string in .env.local
DATABASE_URL=mysql://user:password@host:3306/database

# Test connection
pnpm drizzle-kit push
```

### Issue: Port 3000 Already in Use

**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 pnpm dev
```

### Issue: LLM API Key Invalid

**Solution:**
1. Verify API key in Manus dashboard
2. Check .env.local has correct key
3. Ensure API endpoint is correct
4. Test with: `curl -H "Authorization: Bearer $KEY" $ENDPOINT`

### Issue: Build Fails

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Check TypeScript errors
pnpm check

# Run tests
pnpm test
```

### Issue: Slow Performance

**Solution:**
1. Enable database indexes (see Performance Optimization)
2. Check server resources (CPU, RAM, disk)
3. Enable caching in Nginx/Cloudflare
4. Optimize LLM response time
5. Use CDN for static assets

---

## 📞 Support & Resources

### Documentation
- [Manus Documentation](https://docs.manus.im)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [tRPC Documentation](https://trpc.io)

### Useful Commands
```bash
# Development
pnpm dev              # Start dev server
pnpm test             # Run tests
pnpm check            # TypeScript check
pnpm format           # Format code

# Database
pnpm drizzle-kit generate  # Generate migrations
pnpm drizzle-kit push      # Apply migrations

# Production
pnpm build            # Build for production
pnpm start            # Start production server
```

### Common Issues Checklist
- [ ] Node.js version 18+?
- [ ] Environment variables set?
- [ ] Database running and accessible?
- [ ] Firewall allows port 3000?
- [ ] All dependencies installed?
- [ ] Database migrations applied?

---

## 🎯 Next Steps

1. **Customize Knowledge Base**: Update `knowledge-base.json` with your Q&A content
2. **Add Custom Branding**: Update logo and colors in `client/src/index.css`
3. **Configure Analytics**: Set up analytics endpoint
4. **Set Up Monitoring**: Configure error tracking (Sentry, etc.)
5. **Enable Backups**: Set up automated database backups

---

## 📝 License

This project is proprietary to MMOCCUL. All rights reserved.

---

**Last Updated**: April 2026
**Version**: 1.0.0
