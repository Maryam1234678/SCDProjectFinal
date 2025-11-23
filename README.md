# NodeVault - Node.js CRUD Application with MongoDB

A command-line CRUD application built with Node.js and MongoDB, featuring Docker containerization and Docker Compose orchestration.

## Features

- ✅ Create, Read, Update, Delete (CRUD) operations
- ✅ Search records by name or ID
- ✅ Sort records by name or date
- ✅ Export data to text file
- ✅ Automatic backup system
- ✅ View vault statistics
- ✅ MongoDB integration
- ✅ Environment variable configuration
- ✅ Docker containerization
- ✅ Docker Compose orchestration

## Prerequisites

- Docker
- Docker Compose
- Node.js 20+ (for local development)

## Quick Start with Docker Compose

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd SCDProject25
```

### 2. Configure Environment Variables

Create a `.env.local` file or rename the provided example:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your MongoDB credentials:
```env
MONGO_INITDB_ROOT_USERNAME=admin
MONGO_INITDB_ROOT_PASSWORD=your_password
MONGO_INITDB_DATABASE=NodeVaultDB
NODE_ENV=production
APP_NAME=NodeVault
MONGODB_URI=mongodb://admin:your_password@mongodb:27017/NodeVaultDB?authSource=admin
```

### 3. Build and Start Services
```bash
# Build images and start all services
docker-compose --env-file .env.local up --build -d

# View logs
docker-compose --env-file .env.local logs -f

# Check status
docker-compose --env-file .env.local ps
```

### 4. Access the Application

The backend container will start automatically. To interact with the CLI:
```bash
docker exec -it nodevault-backend node main.js
```

### 5. Stop Services
```bash
docker-compose --env-file .env.local down

# To remove volumes as well
docker-compose --env-file .env.local down -v
```

## Project Structure
```
SCDProject25/
├── main.js                 # Main application entry point
├── db/
│   ├── index.js           # Database operations (MongoDB)
│   ├── file.js            # File operations
│   └── record.js          # Record utilities
├── events/
│   ├── index.js           # Event emitter
│   └── logger.js          # Event logger
├── data/
│   └── vault.json         # Local data storage (fallback)
├── backups/               # Automatic backups directory
├── Dockerfile             # Docker configuration for backend
├── docker-compose.yml     # Docker Compose orchestration
├── .env.local             # Environment variables (not in Git)
├── .dockerignore          # Docker ignore file
├── .gitignore             # Git ignore file
├── package.json           # Node.js dependencies
└── README.md              # This file
```

## Docker Compose Services

### Backend Service
- **Image**: Built from local Dockerfile
- **Port**: 3000
- **Depends on**: MongoDB
- **Environment**: Loads from .env.local

### MongoDB Service
- **Image**: mongo:latest
- **Port**: 27017 (internal only)
- **Volumes**: Persistent data storage
- **Health Check**: Automatic monitoring

### Network
- **Type**: Custom bridge network
- **Subnet**: 172.26.0.0/16
- **Isolation**: Services communicate internally

## Available Commands

### Docker Compose Commands
```bash
# Build and start
docker-compose --env-file .env.local up --build

# Start in background
docker-compose --env-file .env.local up -d

# Stop services
docker-compose --env-file .env.local down

# View logs
docker-compose --env-file .env.local logs -f

# Restart services
docker-compose --env-file .env.local restart

# View status
docker-compose --env-file .env.local ps
```

### Database Commands
```bash
# Access MongoDB shell
docker exec -it mongodb mongosh -u admin -p your_password --authenticationDatabase admin

# View records
docker exec mongodb mongosh --eval "db.records.find()" -u admin -p your_password --authenticationDatabase admin NodeVaultDB

# Backup database
docker exec mongodb mongodump --out=/backup
```

## Features Implementation

### 1. Search Functionality
Search for records by name or ID (case-insensitive).

### 2. Sort Records
Sort records by name or creation date in ascending/descending order.

### 3. Export Data
Export all records to a formatted text file.

### 4. Automatic Backup
Creates automatic backups on add/delete operations in the `/backups` directory.

### 5. View Statistics
Displays vault statistics including total records, longest name, and date ranges.

### 6. MongoDB Integration
Persistent data storage using MongoDB with connection pooling and retry logic.

### 7. Environment Configuration
Secure credential management using .env files.

## Development

### Local Development Setup
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Run locally
node main.js
```

### Running Tests
```bash
npm test
```

## Docker Hub

Pre-built images available at:
- Backend: `maryam1234678/nodevault-backend:latest`

Pull and run:
```bash
docker pull maryam1234678/nodevault-backend:latest
```

## Troubleshooting

### Port 3000 Already in Use
```bash
# Stop conflicting containers
docker stop $(docker ps -q --filter "publish=3000")
```

### MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Verify network connectivity
docker exec nodevault-backend ping -c 3 mongodb
```

### Reset Everything
```bash
# Complete cleanup
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## License

ISC

## Author

Your Name

## Acknowledgments

- Assignment project for Software Configuration Deployment course
- Built with Node.js, MongoDB, Docker, and Docker Compose
