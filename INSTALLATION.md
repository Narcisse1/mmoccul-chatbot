# MMOCCUL Chatbot - Installation Guide

## 📦 Archive Contents

Your archive contains the complete MMOCCUL WhatsApp-style chatbot with:
- ✅ Full source code (React frontend + Express backend)
- ✅ Database schema and migrations
- ✅ AI/LLM integration ready
- ✅ WhatsApp-style UI components
- ✅ Automated setup scripts
- ✅ Docker configuration
- ✅ Complete documentation

## 🚀 Installation Steps

### Step 1: Extract the Archive

**Linux/Mac:**
```bash
tar -xzf mmoccul-chatbot-complete.tar.gz
cd mmoccul-chatbot
```

**Windows:**
- Right-click the `.zip` file
- Select "Extract All"
- Navigate to the extracted folder

### Step 2: Install Prerequisites

#### Option A: Automated Setup (Recommended)

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bash
setup.bat
```

The script will:
- ✅ Check Node.js and pnpm installation
- ✅ Install project dependencies
- ✅ Create database
- ✅ Run migrations
- ✅ Run tests

#### Option B: Manual Setup

**1. Install Node.js**
- Download from [nodejs.org](https://nodejs.org) (v18+)
- Verify: `node --version`

**2. Install pnpm**
```bash
npm install -g pnpm
```

**3. Install MySQL**
- Download from [mysql.com](https://www.mysql.com/downloads/) (v8.0+)
- Start MySQL service

**4. Install Dependencies**
```bash
cd mmoccul-chatbot
pnpm install
```

**5. Create Database**
```bash
mysql -u root -p
# Enter password when prompted
```

```sql
CREATE DATABASE mmoccul_chatbot CHARACTER SET utf8mb4;
CREATE USER 'mmoccul_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON mmoccul_chatbot.* TO 'mmoccul_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

**6. Configure Environment**
```bash
# Copy example to actual file
cp .env.example .env.local

# Edit with your credentials
# Update DATABASE_URL and API keys
nano .env.local  # or use your preferred editor
```

**7. Run Migrations**
```bash
pnpm drizzle-kit push
```

**8. Run Tests**
```bash
pnpm test
```

### Step 3: Start the Application

**Development Mode:**
```bash
pnpm dev
```

Open browser to: **http://localhost:3000**

**Production Mode:**
```bash
pnpm build
pnpm start
```

## 🔑 Environment Variables Setup

Create `.env.local` file with these variables:

### Database
```env
DATABASE_URL=mysql://mmoccul_user:secure_password@localhost:3306/mmoccul_chatbot
```

### Authentication (Get from Manus Dashboard)
```env
JWT_SECRET=your_jwt_secret_here
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
```

### LLM Integration (Get from Manus Dashboard)
```env
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge
```

### Application
```env
VITE_APP_TITLE=MMOCCUL Support
OWNER_NAME=MMOCCUL
OWNER_OPEN_ID=your_owner_open_id
```

## 🐳 Docker Installation

### Quick Docker Setup
```bash
# Build image
docker build -t mmoccul-chatbot .

# Run with Docker Compose
docker-compose up -d
```

The application will be available at: **http://localhost:3000**

### Docker Compose with Custom Environment
```bash
# Create .env file
cat > .env << EOF
DB_USER=mmoccul_user
DB_PASSWORD=secure_password
JWT_SECRET=your_secret
VITE_APP_ID=your_app_id
BUILT_IN_FORGE_API_KEY=your_key
EOF

# Start services
docker-compose up -d
```

## ✅ Verification Checklist

After installation, verify everything works:

- [ ] Node.js v18+ installed: `node --version`
- [ ] pnpm installed: `pnpm --version`
- [ ] MySQL running: `mysql -u root -p`
- [ ] Dependencies installed: `pnpm list`
- [ ] Database created: `mysql -u mmoccul_user -p mmoccul_chatbot`
- [ ] .env.local configured with credentials
- [ ] Tests pass: `pnpm test` (should show 8/8 passing)
- [ ] Dev server starts: `pnpm dev`
- [ ] Chatbot loads: Open http://localhost:3000
- [ ] Can send messages and get responses
- [ ] Quick replies appear
- [ ] Branch locator works (click map icon)

## 🌐 Deployment

### Deploy to Manus Platform (Easiest)
1. Open Management UI
2. Click "Publish" button
3. Configure domain
4. Done! ✅

### Deploy to Docker
```bash
docker-compose up -d
```

### Deploy to Railway
1. Push to GitHub
2. Connect GitHub to Railway
3. Add environment variables
4. Deploy

### Deploy to Traditional VPS
See `DEPLOYMENT_GUIDE.md` for:
- AWS EC2
- DigitalOcean
- Linode
- And more...

## 📁 Project Structure

```
mmoccul-chatbot/
├── client/                    # React frontend
│   ├── src/
│   │   ├── pages/Chat.tsx    # Main chat interface
│   │   ├── components/       # UI components
│   │   └── index.css         # WhatsApp styling
│   └── public/
├── server/                    # Express backend
│   ├── routers.ts            # API endpoints
│   ├── db.ts                 # Database queries
│   └── chat.test.ts          # Tests
├── drizzle/                   # Database
│   ├── schema.ts             # Table definitions
│   └── migrations/           # Migration files
├── knowledge-base.json        # Q&A content
├── package.json              # Dependencies
├── .env.local                # Environment variables
├── Dockerfile                # Docker config
├── docker-compose.yml        # Docker Compose
├── setup.sh                  # Linux/Mac setup
├── setup.bat                 # Windows setup
├── README.md                 # Project overview
├── QUICK_START.md            # Quick start guide
└── DEPLOYMENT_GUIDE.md       # Deployment instructions
```

## 🆘 Troubleshooting

### "Node.js not found"
```bash
# Install Node.js from https://nodejs.org
# Then verify:
node --version
```

### "MySQL connection failed"
```bash
# Check MySQL is running
mysql -u root -p

# Verify DATABASE_URL in .env.local
# Format: mysql://user:password@host:port/database
```

### "Port 3000 already in use"
```bash
# Use different port
PORT=3001 pnpm dev
```

### "Dependencies installation failed"
```bash
# Clear cache and retry
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### "Tests fail"
```bash
# Ensure database is set up
pnpm drizzle-kit push

# Run tests again
pnpm test
```

### "LLM API errors"
- Verify API key in `.env.local`
- Check Manus dashboard for valid credentials
- Ensure API endpoint is accessible

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview and features |
| `QUICK_START.md` | 5-minute setup guide |
| `DEPLOYMENT_GUIDE.md` | Complete deployment instructions |
| `INSTALLATION.md` | This file - installation steps |

## 🎯 Next Steps

1. **Customize Knowledge Base**: Edit `knowledge-base.json` with your Q&A
2. **Update Branding**: Change logo and colors in `.env.local` and `client/src/index.css`
3. **Test Thoroughly**: Run `pnpm test` and test manually
4. **Deploy**: Choose deployment option and follow guide
5. **Monitor**: Set up logging and monitoring

## 📞 Support

- Check `DEPLOYMENT_GUIDE.md` for detailed help
- Review `README.md` for API documentation
- Run `pnpm test` to verify setup
- Check `.manus-logs/` for error messages

## ✨ You're All Set!

Your MMOCCUL chatbot is ready to use. Start with:

```bash
pnpm dev
```

Then open: **http://localhost:3000**

For production deployment, see `DEPLOYMENT_GUIDE.md`

---

**Version**: 1.0.0  
**Last Updated**: April 2026  
**Status**: Production Ready ✅
