#!/bin/bash

# ============================================
# MMOCCUL Chatbot - Automated Setup Script
# ============================================
# This script automates the setup process

set -e

echo "=========================================="
echo "MMOCCUL Chatbot - Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js v18+${NC}"
    echo "Download from: https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Check pnpm
echo -e "${YELLOW}Checking pnpm...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}pnpm not found. Installing...${NC}"
    npm install -g pnpm
fi
PNPM_VERSION=$(pnpm -v)
echo -e "${GREEN}✓ pnpm ${PNPM_VERSION}${NC}"

# Check MySQL
echo -e "${YELLOW}Checking MySQL...${NC}"
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}MySQL is not installed.${NC}"
    echo "Please install MySQL 8.0+ from: https://www.mysql.com/downloads/"
    exit 1
fi
echo -e "${GREEN}✓ MySQL installed${NC}"

# Install dependencies
echo ""
echo -e "${YELLOW}Installing dependencies...${NC}"
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Create .env.local if it doesn't exist
echo ""
echo -e "${YELLOW}Setting up environment variables...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating .env.local file...${NC}"
    cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL=mysql://root:password@localhost:3306/mmoccul_chatbot

# Authentication (Get from Manus Dashboard)
JWT_SECRET=your_jwt_secret_here
VITE_APP_ID=your_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im

# LLM Integration
BUILT_IN_FORGE_API_URL=https://api.manus.im/forge
BUILT_IN_FORGE_API_KEY=your_api_key
VITE_FRONTEND_FORGE_API_KEY=your_frontend_key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im/forge

# Application
VITE_APP_TITLE=MMOCCUL Support
OWNER_NAME=MMOCCUL
OWNER_OPEN_ID=your_owner_open_id
EOF
    echo -e "${GREEN}✓ .env.local created${NC}"
    echo -e "${YELLOW}⚠ Please edit .env.local with your credentials${NC}"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

# Setup database
echo ""
echo -e "${YELLOW}Setting up database...${NC}"
echo "Please enter your MySQL root password:"
mysql -u root -p << EOF
CREATE DATABASE IF NOT EXISTS mmoccul_chatbot CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF
echo -e "${GREEN}✓ Database created${NC}"

# Run migrations
echo ""
echo -e "${YELLOW}Running database migrations...${NC}"
pnpm drizzle-kit push
echo -e "${GREEN}✓ Database migrations applied${NC}"

# Run tests
echo ""
echo -e "${YELLOW}Running tests...${NC}"
if pnpm test; then
    echo -e "${GREEN}✓ All tests passed${NC}"
else
    echo -e "${RED}Some tests failed. Please check the output above.${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your credentials"
echo "2. Run: pnpm dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "For deployment, see DEPLOYMENT_GUIDE.md"
echo ""
