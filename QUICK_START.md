# MMOCCUL Chatbot - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Prerequisites
Make sure you have installed:
- **Node.js** v18+ ([Download](https://nodejs.org))
- **pnpm** (run: `npm install -g pnpm`)
- **MySQL** 8.0+ ([Download](https://www.mysql.com/downloads/))

### Step 2: Extract & Navigate
```bash
# Extract the archive
unzip mmoccul-chatbot.zip
cd mmoccul-chatbot
```

### Step 3: Install Dependencies
```bash
pnpm install
```

### Step 4: Configure Environment
Create `.env.local` file with your settings:

```env
# Database (update with your MySQL credentials)
DATABASE_URL=mysql://root:password@localhost:3306/mmoccul_chatbot

# Get these from Manus Dashboard (https://dashboard.manus.im)
JWT_SECRET=your_jwt_secret_here
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge

# Application
VITE_APP_TITLE=MMOCCUL Support
OWNER_NAME=MMOCCUL
```

### Step 5: Setup Database
```bash
# Create database
mysql -u root -p << EOF
CREATE DATABASE mmoccul_chatbot CHARACTER SET utf8mb4;
EOF

# Run migrations
pnpm drizzle-kit push
```

### Step 6: Start Development Server
```bash
pnpm dev
```

Open your browser to: **http://localhost:3000**

---

## 📱 Test the Chatbot

1. You should see the WhatsApp-style interface
2. Click on a suggested question or type your own
3. The AI bot will respond with information from the knowledge base
4. Click the map icon to see branch locations

---

## 🌐 Deploy to Production

### Option A: Manus Platform (Easiest)
1. Open Management UI (click "View" on project card)
2. Click "Publish" button in top-right
3. Configure domain and click "Publish"
4. Done! Your chatbot is live

### Option B: Railway (Recommended for beginners)
1. Push code to GitHub
2. Go to [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub"
4. Select your repository
5. Add environment variables
6. Deploy

### Option C: Docker (Advanced)
```bash
# Build image
docker build -t mmoccul-chatbot .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="mysql://..." \
  -e JWT_SECRET="..." \
  mmoccul-chatbot
```

---

## 🔧 Common Commands

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm test             # Run tests
pnpm check            # Check TypeScript

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Database
pnpm drizzle-kit generate  # Create migration
pnpm drizzle-kit push      # Apply migration

# Code Quality
pnpm format           # Format code with Prettier
```

---

## 🆘 Troubleshooting

### "Cannot find module" error
```bash
# Clear and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database connection failed
```bash
# Check MySQL is running
mysql -u root -p

# Verify DATABASE_URL in .env.local
# Format: mysql://user:password@host:port/database
```

### Port 3000 already in use
```bash
# Use different port
PORT=3001 pnpm dev
```

### LLM API errors
- Verify API key in `.env.local`
- Check Manus dashboard for valid credentials
- Ensure API endpoint is accessible

---

## 📚 Project Structure

```
mmoccul-chatbot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Chat page
│   │   ├── components/    # ChatBox, QuickReplies, BranchLocator
│   │   └── index.css      # WhatsApp styling
│   └── public/
├── server/                 # Express backend
│   ├── routers.ts         # Chat API endpoints
│   ├── db.ts              # Database queries
│   └── chat.test.ts       # Tests
├── drizzle/               # Database schema
│   └── schema.ts          # Tables definition
├── knowledge-base.json    # Q&A content
├── .env.local             # Environment variables
├── package.json           # Dependencies
└── DEPLOYMENT_GUIDE.md    # Full deployment guide
```

---

## 🎨 Customize Your Chatbot

### Update Knowledge Base
Edit `knowledge-base.json`:
```json
{
  "qa": [
    {
      "question": "Your question",
      "answer": "Your answer"
    }
  ]
}
```

### Change Colors
Edit `client/src/index.css` - look for color variables:
```css
--primary: oklch(0.5 0.2 142);  /* WhatsApp green */
```

### Update Branding
- Logo: Update `VITE_APP_LOGO` in `.env.local`
- Title: Update `VITE_APP_TITLE` in `.env.local`
- Header: Edit `client/src/components/ChatBox.tsx`

---

## 📞 Need Help?

1. Check `DEPLOYMENT_GUIDE.md` for detailed instructions
2. Review `server/chat.test.ts` for API examples
3. Check `.manus-logs/` for error messages
4. Run `pnpm test` to verify setup

---

## ✅ Verification Checklist

Before going live:
- [ ] Database is running and accessible
- [ ] All environment variables are set
- [ ] `pnpm test` passes (8/8 tests)
- [ ] Chatbot responds to test questions
- [ ] Branch locator shows locations
- [ ] Quick replies work
- [ ] Mobile view is responsive

---

**Ready to deploy?** See `DEPLOYMENT_GUIDE.md` for production setup!
