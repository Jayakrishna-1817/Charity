# CharityChain - Blockchain-Based Transparent Donation Platform

## Overview

CharityChain is a revolutionary blockchain-based platform that ensures transparency and accountability in charitable donations. By leveraging smart contracts, decentralized storage (IPFS), and secure user interfaces, the platform addresses widespread charity fraud by enabling donors to track their funds, charities to submit verified utilization reports, and auditors to independently verify transactions.

## Features

### 🔗 Blockchain Technology
- **Smart Contracts**: Ethereum/Polygon-based smart contracts for transparent fund management
- **Immutable Records**: All donations and expenses recorded permanently on the blockchain
- **Milestone-Based Releases**: Funds released only upon completion of verified milestones
- **Audit Trail**: Complete transaction history with cryptographic verification

### 💰 Donation Management
- **Real-time Tracking**: Track donations from source to utilization
- **Multiple Payment Methods**: Support for cryptocurrency and traditional payments
- **Automated Escrow**: Smart contract-based fund holding and release
- **Donor Dashboard**: Comprehensive view of donation history and impact

### 🏢 Charity Management
- **Registration & Verification**: Multi-step charity verification process
- **Project Creation**: Create and manage fundraising projects
- **Milestone Reporting**: Submit progress reports with supporting documents
- **Transparency Reports**: Automated generation of utilization reports

### 📄 Document Management
- **IPFS Storage**: Decentralized storage for all critical documents
- **Document Verification**: Cryptographic verification of document integrity
- **Secure Access**: Role-based access control for sensitive information
- **Audit Support**: Complete document trail for auditing purposes

### 🔐 Security & Authentication
- **MetaMask Integration**: Secure wallet-based authentication
- **Multi-factor Authentication**: Enhanced security for sensitive operations
- **Role-based Access**: Different access levels for donors, charities, and auditors
- **Encryption**: End-to-end encryption for sensitive data

## Technology Stack

### Frontend
- **React.js**: Modern, responsive user interface
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Ethers.js**: Ethereum blockchain interaction
- **React Router**: Client-side routing

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for application data
- **JWT**: JSON Web Token authentication
- **Multer**: File upload handling

### Blockchain
- **Solidity**: Smart contract development
- **Hardhat**: Development environment and testing framework
- **OpenZeppelin**: Security-audited contract libraries
- **MetaMask**: Wallet integration and transaction signing

### Storage & Infrastructure
- **IPFS**: Decentralized file storage
- **MongoDB**: Application database
- **Docker**: Containerization (optional)
- **Vercel/Netlify**: Frontend deployment
- **Heroku/AWS**: Backend deployment

## Project Structure

```
blockchain-charity-platform/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API and Web3 services
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # CSS and styling
│   └── public/             # Static assets
├── backend/                 # Node.js/Express.js backend
│   ├── models/             # MongoDB data models
│   ├── routes/             # API route handlers
│   ├── middleware/         # Authentication and validation
│   ├── utils/              # Utility functions
│   └── uploads/            # File upload directory
├── smart-contracts/        # Blockchain smart contracts
│   ├── contracts/          # Solidity contract files
│   ├── scripts/            # Deployment scripts
│   ├── test/               # Contract tests
│   └── artifacts/          # Compiled contracts
└── docs/                   # Documentation
    ├── architecture.md     # System architecture
    ├── api.md             # API documentation
    └── deployment.md      # Deployment guide
```

## Smart Contracts

### CharityRegistry.sol
Manages charity registration, verification, and metadata storage.

**Key Functions:**
- `registerCharity()`: Register a new charity organization
- `verifyCharity()`: Verify charity legitimacy (admin only)
- `getCharity()`: Retrieve charity information
- `updateCharity()`: Update charity details

### DonationManager.sol
Handles project creation, donations, and milestone-based fund releases.

**Key Functions:**
- `createProject()`: Create a new fundraising project
- `donate()`: Make a donation to a project
- `submitMilestone()`: Submit project milestone for approval
- `approveMilestone()`: Approve milestone and release funds
- `withdrawFunds()`: Withdraw approved funds

### AuditTrail.sol
Maintains immutable audit records for all platform activities.

**Key Functions:**
- `createAuditRecord()`: Create new audit entry
- `getAuditRecord()`: Retrieve audit information
- `verifyAuditRecord()`: Verify record integrity
- `getAuditsByTimeRange()`: Get audits within date range

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Charities
- `GET /api/charities` - List all charities
- `POST /api/charities` - Register new charity
- `GET /api/charities/:id` - Get charity details
- `PUT /api/charities/:id` - Update charity
- `POST /api/charities/:id/verify` - Verify charity

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `POST /api/projects/:id/milestones` - Submit milestone

### Donations
- `GET /api/donations` - List donations
- `POST /api/donations` - Make donation
- `GET /api/donations/:id` - Get donation details
- `GET /api/donations/user/:userId` - Get user donations

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get document
- `GET /api/documents/:id/download` - Download document
- `POST /api/documents/:id/verify` - Verify document

### Blockchain
- `POST /api/blockchain/deploy` - Deploy contracts
- `GET /api/blockchain/status` - Get blockchain status
- `POST /api/blockchain/transaction` - Submit transaction
- `GET /api/blockchain/transaction/:hash` - Get transaction status

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB
- MetaMask browser extension
- Git

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit environment variables
nano .env

# Start MongoDB service
sudo systemctl start mongod

# Start the backend server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend/charity-platform-frontend

# Install dependencies
npm install --legacy-peer-deps

# Start the development server
npm run dev
```

### Smart Contract Setup
```bash
# Navigate to smart contracts directory
cd smart-contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to local network
npx hardhat run scripts/deploy.js --network localhost

# Deploy to testnet (configure network in hardhat.config.js)
npx hardhat run scripts/deploy.js --network goerli
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/charitychain
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# IPFS Configuration
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Blockchain Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your_project_id
POLYGON_RPC_URL=https://polygon-mainnet.infura.io/v3/your_project_id
PRIVATE_KEY=your_private_key_for_deployment
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_CHARITY_REGISTRY_ADDRESS=0x...
REACT_APP_DONATION_MANAGER_ADDRESS=0x...
REACT_APP_AUDIT_TRAIL_ADDRESS=0x...
REACT_APP_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

## Testing

### Smart Contract Tests
```bash
cd smart-contracts
npx hardhat test
```

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend/charity-platform-frontend
npm test
```

### Integration Tests
```bash
# Run all tests
npm run test:all

# Run specific test suite
npm run test:integration
```

## Deployment

### Frontend Deployment (Vercel)
```bash
# Build the frontend
cd frontend/charity-platform-frontend
npm run build

# Deploy to Vercel
vercel --prod
```

### Backend Deployment (Heroku)
```bash
# Login to Heroku
heroku login

# Create new app
heroku create charitychain-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
heroku config:set JWT_SECRET=your_jwt_secret

# Deploy
git push heroku main
```

### Smart Contract Deployment
```bash
# Deploy to Ethereum mainnet
npx hardhat run scripts/deploy.js --network mainnet

# Deploy to Polygon
npx hardhat run scripts/deploy.js --network polygon

# Verify contracts on Etherscan
npx hardhat verify --network mainnet CONTRACT_ADDRESS
```

## Security Considerations

### Smart Contract Security
- All contracts inherit from OpenZeppelin's security libraries
- ReentrancyGuard protection on all state-changing functions
- Access control with role-based permissions
- Input validation and overflow protection
- Emergency pause functionality for critical issues

### Backend Security
- JWT-based authentication with secure token storage
- Input validation and sanitization
- Rate limiting on API endpoints
- CORS configuration for cross-origin requests
- File upload restrictions and validation
- Environment variable protection

### Frontend Security
- Secure wallet integration with MetaMask
- Client-side input validation
- XSS protection with React's built-in sanitization
- Secure API communication over HTTPS
- Local storage encryption for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint and Prettier configurations
- Write comprehensive tests for new features
- Update documentation for API changes
- Follow semantic versioning for releases
- Ensure all tests pass before submitting PR

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue on GitHub
- Join our Discord community
- Email: support@charitychain.org
- Documentation: https://docs.charitychain.org

## Roadmap

### Phase 1 (Current)
- ✅ Core platform development
- ✅ Smart contract implementation
- ✅ Basic UI/UX design
- ✅ MetaMask integration

### Phase 2 (Q2 2024)
- 🔄 Mobile application development
- 🔄 Advanced analytics dashboard
- 🔄 Multi-language support
- 🔄 Enhanced security features

### Phase 3 (Q3 2024)
- ⏳ Integration with major payment processors
- ⏳ AI-powered fraud detection
- ⏳ Automated compliance reporting
- ⏳ Third-party API integrations

### Phase 4 (Q4 2024)
- ⏳ Global expansion
- ⏳ Institutional partnerships
- ⏳ Advanced governance features
- ⏳ Sustainability tracking

## Acknowledgments

- OpenZeppelin for secure smart contract libraries
- Ethereum Foundation for blockchain infrastructure
- IPFS for decentralized storage solutions
- React and Node.js communities for excellent frameworks
- All contributors and supporters of transparent charity

---

**CharityChain** - *Transforming charitable giving through blockchain transparency*

