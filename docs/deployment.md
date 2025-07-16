# CharityChain Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the CharityChain platform to production environments. The platform consists of three main components:

1. **Frontend**: React.js application
2. **Backend**: Node.js/Express.js API server
3. **Smart Contracts**: Ethereum/Polygon blockchain contracts

## Prerequisites

### Development Tools
- Node.js (v16 or higher)
- npm or yarn package manager
- Git version control
- MongoDB database
- Hardhat development environment

### Accounts & Services
- MongoDB Atlas account (for cloud database)
- Infura account (for blockchain RPC access)
- Vercel/Netlify account (for frontend hosting)
- Heroku/AWS account (for backend hosting)
- Domain name (optional)

### Browser Extensions
- MetaMask wallet extension
- React Developer Tools (for debugging)

## Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-username/blockchain-charity-platform.git
cd blockchain-charity-platform
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
npm install
```

#### Frontend Dependencies
```bash
cd ../frontend/charity-platform-frontend
npm install --legacy-peer-deps
```

#### Smart Contract Dependencies
```bash
cd ../../smart-contracts
npm install
```

## Database Setup

### Local MongoDB
```bash
# Install MongoDB (Ubuntu)
sudo apt update
sudo apt install mongodb

# Start MongoDB service
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Create database
mongo
use charitychain
```

### MongoDB Atlas (Production)
1. Create account at https://cloud.mongodb.com
2. Create new cluster
3. Configure network access (allow all IPs: 0.0.0.0/0)
4. Create database user
5. Get connection string

## Smart Contract Deployment

### 1. Configure Networks
Edit `smart-contracts/hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.19",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: process.env.MAINNET_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};
```

### 2. Set Environment Variables
Create `smart-contracts/.env`:

```env
PRIVATE_KEY=your_wallet_private_key
GOERLI_RPC_URL=https://goerli.infura.io/v3/your_project_id
MAINNET_RPC_URL=https://mainnet.infura.io/v3/your_project_id
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Deploy Contracts

#### Local Deployment (Testing)
```bash
# Start local Hardhat node
npx hardhat node

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost
```

#### Testnet Deployment
```bash
# Deploy to Goerli testnet
npx hardhat run scripts/deploy.js --network goerli

# Verify contracts
npx hardhat verify --network goerli CONTRACT_ADDRESS
```

#### Mainnet Deployment
```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon
```

### 4. Save Contract Addresses
After deployment, save the contract addresses for frontend configuration.

## Backend Deployment

### 1. Environment Configuration
Create `backend/.env`:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/charitychain
JWT_SECRET=your_super_secure_jwt_secret_key_here
JWT_EXPIRE=7d

# IPFS Configuration
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Blockchain Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_project_id
```

### 2. Heroku Deployment

#### Install Heroku CLI
```bash
# Ubuntu/Debian
curl https://cli-assets.heroku.com/install.sh | sh

# Login to Heroku
heroku login
```

#### Create Heroku App
```bash
cd backend
heroku create charitychain-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI="your_mongodb_atlas_connection_string"
heroku config:set JWT_SECRET="your_jwt_secret"
heroku config:set JWT_EXPIRE=7d
```

#### Deploy to Heroku
```bash
# Initialize git repository
git init
git add .
git commit -m "Initial backend deployment"

# Add Heroku remote
heroku git:remote -a charitychain-backend

# Deploy
git push heroku main
```

### 3. AWS EC2 Deployment (Alternative)

#### Launch EC2 Instance
1. Create AWS account
2. Launch Ubuntu 20.04 LTS instance
3. Configure security groups (ports 22, 80, 443, 5000)
4. Connect via SSH

#### Setup Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 process manager
sudo npm install -g pm2

# Clone repository
git clone https://github.com/your-username/blockchain-charity-platform.git
cd blockchain-charity-platform/backend

# Install dependencies
npm install

# Start application with PM2
pm2 start server.js --name "charitychain-backend"
pm2 startup
pm2 save
```

#### Configure Nginx (Optional)
```bash
# Install Nginx
sudo apt install nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/charitychain

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/charitychain /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Frontend Deployment

### 1. Environment Configuration
Create `frontend/charity-platform-frontend/.env`:

```env
REACT_APP_API_URL=https://your-backend-url.herokuapp.com/api
REACT_APP_CHARITY_REGISTRY_ADDRESS=0x...
REACT_APP_DONATION_MANAGER_ADDRESS=0x...
REACT_APP_AUDIT_TRAIL_ADDRESS=0x...
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### 2. Vercel Deployment

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Deploy to Vercel
```bash
cd frontend/charity-platform-frontend

# Build the application
npm run build

# Deploy to Vercel
vercel --prod

# Follow prompts to configure deployment
```

#### Configure Vercel Project
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add all environment variables from `.env`

### 3. Netlify Deployment (Alternative)

#### Build and Deploy
```bash
cd frontend/charity-platform-frontend

# Build the application
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

#### Configure Netlify
1. Go to Netlify dashboard
2. Select your site
3. Go to Site settings > Environment variables
4. Add all environment variables

### 4. Custom Domain Setup

#### DNS Configuration
```
Type: A
Name: @
Value: [Your server IP]

Type: CNAME
Name: www
Value: your-domain.com
```

#### SSL Certificate
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

## IPFS Setup

### 1. Install IPFS Node
```bash
# Download IPFS
wget https://dist.ipfs.io/go-ipfs/v0.14.0/go-ipfs_v0.14.0_linux-amd64.tar.gz
tar -xvzf go-ipfs_v0.14.0_linux-amd64.tar.gz
cd go-ipfs
sudo bash install.sh

# Initialize IPFS
ipfs init

# Start IPFS daemon
ipfs daemon
```

### 2. Configure IPFS API
```bash
# Enable CORS for web access
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "GET", "POST"]'
```

### 3. IPFS Service (Production)
```bash
# Create systemd service
sudo nano /etc/systemd/system/ipfs.service

# Add service configuration:
[Unit]
Description=IPFS daemon
After=network.target

[Service]
Type=simple
User=ubuntu
ExecStart=/usr/local/bin/ipfs daemon
Restart=always

[Install]
WantedBy=multi-user.target

# Enable and start service
sudo systemctl enable ipfs
sudo systemctl start ipfs
```

## Testing Deployment

### 1. Backend Health Check
```bash
curl https://your-backend-url.herokuapp.com/api/health
```

### 2. Frontend Accessibility
```bash
curl https://your-frontend-url.vercel.app
```

### 3. Smart Contract Interaction
```bash
# Test contract deployment
npx hardhat console --network mainnet

# Verify contract on Etherscan
npx hardhat verify --network mainnet CONTRACT_ADDRESS
```

### 4. End-to-End Testing
1. Open frontend application
2. Connect MetaMask wallet
3. Register as charity
4. Create project
5. Make donation
6. Verify transaction on blockchain

## Monitoring & Maintenance

### 1. Application Monitoring
```bash
# Backend logs (Heroku)
heroku logs --tail -a charitychain-backend

# Frontend analytics (Vercel)
# Check Vercel dashboard for analytics

# Server monitoring (PM2)
pm2 monit
```

### 2. Database Monitoring
```bash
# MongoDB Atlas monitoring
# Check Atlas dashboard for performance metrics

# Local MongoDB monitoring
mongo --eval "db.stats()"
```

### 3. Blockchain Monitoring
- Monitor contract events on Etherscan
- Set up alerts for failed transactions
- Track gas usage and optimization opportunities

### 4. Security Updates
```bash
# Update dependencies regularly
npm audit
npm update

# Monitor security advisories
# Subscribe to security mailing lists
```

## Troubleshooting

### Common Issues

#### 1. MetaMask Connection Issues
- Ensure correct network is selected
- Check contract addresses in environment variables
- Verify wallet has sufficient funds for gas

#### 2. CORS Errors
- Configure backend CORS settings
- Check frontend API URL configuration
- Verify SSL certificates

#### 3. Database Connection Issues
- Check MongoDB Atlas network access
- Verify connection string format
- Test database connectivity

#### 4. Smart Contract Deployment Failures
- Check account balance for gas fees
- Verify network configuration
- Review contract compilation errors

### Performance Optimization

#### 1. Frontend Optimization
```bash
# Analyze bundle size
npm run build
npx webpack-bundle-analyzer dist/static/js/*.js
```

#### 2. Backend Optimization
```bash
# Enable compression
npm install compression
# Add to server.js: app.use(compression())

# Database indexing
# Add indexes to frequently queried fields
```

#### 3. Smart Contract Optimization
- Optimize gas usage in contracts
- Use events for data storage when possible
- Implement efficient data structures

## Backup & Recovery

### 1. Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb+srv://username:password@cluster.mongodb.net/charitychain"

# Restore backup
mongorestore --uri="mongodb+srv://username:password@cluster.mongodb.net/charitychain" dump/
```

### 2. Smart Contract Backup
- Save contract source code and ABIs
- Document deployment transactions
- Backup private keys securely

### 3. Application Backup
```bash
# Backup application code
git push origin main

# Backup environment configurations
# Store securely (not in version control)
```

## Support & Documentation

### Resources
- [Hardhat Documentation](https://hardhat.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [IPFS Documentation](https://docs.ipfs.io/)

### Community
- GitHub Issues: Report bugs and feature requests
- Discord: Join community discussions
- Documentation: Comprehensive guides and tutorials

---

**Note**: This deployment guide assumes basic familiarity with blockchain development, web development, and server administration. For production deployments, consider additional security measures, monitoring, and backup strategies.

