# Expense Tracker - Backend API

A robust, scalable RESTful API built with Node.js, Express, and MongoDB for managing personal expenses and tracking financial transactions. Features message queue integration with RabbitMQ, Redis caching, email notifications, and background workers for async processing.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (with Mongoose ODM)
- **Message Queue:** RabbitMQ (AMQP)
- **Cache:** Redis
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcrypt for password hashing
- **File Upload:** Multer middleware
- **Email Service:** Nodemailer (Gmail)
- **Containerization:** Docker & Docker Compose

## Architecture

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Client    │─────▶│  Express    │─────▶│  MongoDB    │
│             │      │   Server    │      │             │
└─────────────┘      └──────┬──────┘      └─────────────┘
                            │
                ┌───────────┼───────────┐
                │           │           │
         ┌──────▼─────┐ ┌──▼──────┐ ┌──▼──────────┐
         │  RabbitMQ  │ │  Redis  │ │   Worker    │
         │  (Queue)   │ │ (Cache) │ │  (Consumer) │
         └────────────┘ └─────────┘ └─────────────┘
```

## Features

- **User Authentication & Authorization**
  - JWT-based session management
  - Secure password hashing with bcrypt
  - Session management with Redis
  - Multi-device session support

- **Expense & Income Tracking**
  - Create, read, update, delete expenses/income
  - Category-based expense organization
  - Source-based income tracking
  - File upload support for receipts

- **Dashboard Analytics**
  - Financial statistics and summaries
  - Monthly trends (6-month history)
  - Top expense categories
  - Savings rate calculation
  - Transaction statistics
  - Redis caching for performance

- **Message Queue Integration**
  - Async event processing with RabbitMQ
  - Event-driven architecture
  - Separate worker process for consumers
  - Retry mechanism with dead letter handling

- **Caching Layer**
  - Redis integration for high-performance caching
  - Cache invalidation on data updates
  - Fallback to database on cache miss

- **Email Notifications**
  - OTP generation and verification
  - Email service with Nodemailer
  - HTML email templates

- **Excel Export**
  - Export expense/income data to Excel format

- **Docker Support**
  - Multi-container setup with Docker Compose
  - MongoDB, Redis, and RabbitMQ containers
  - Persistent volumes for data

## Prerequisites

Before running this application, ensure you have:

- **Node.js** (v14 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **Redis** (local or cloud)
- **RabbitMQ** (local or cloud)
- **npm** or **yarn** package manager
- **Docker & Docker Compose** (optional, for containerized setup)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/expense_tracker

# JWT Secret
JWT_SECRET=your_own_jwt_secret_key_here

# Redis Configuration
REDIS_URL=redis://localhost:6379

# RabbitMQ Configuration
RABBITMQ_USER=admin
RABBITMQ_PASS=admin123
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_VHOST=expense_tracker

# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Setup with Docker (Recommended)

Start all services using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- MongoDB (port 27017)
- Redis (port 6379)
- RabbitMQ (AMQP: 5672, Management UI: 15672)

Access RabbitMQ Management UI at `http://localhost:15672`
- Username: `admin`
- Password: `admin123`

### 5. Manual Setup (Without Docker)

**Start MongoDB:**
```bash
# Windows
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

**Start Redis:**
```bash
# Windows (using Redis for Windows)
redis-server

# macOS (Homebrew)
brew services start redis

# Linux
sudo systemctl start redis
```

**Start RabbitMQ:**
```bash
# Windows
rabbitmq-server

# macOS (Homebrew)
brew services start rabbitmq

# Linux
sudo systemctl start rabbitmq-server
```

### 6. Create Uploads Directory

```bash
mkdir uploads
```

## Running the Application

### Development Mode

**Start the main server:**
```bash
npm run dev
```

**Start the worker (in a separate terminal):**
```bash
node workers/consumer.js
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000`

## Project Structure

```
backend/
├── config/                      # Configuration files
│   ├── db.js                    # MongoDB connection
│   ├── redis.js                 # Redis client configuration
│   ├── rabbitmq.js              # RabbitMQ connection manager (singleton)
│   └── queues.js                # Queue definitions & routing keys
│
├── controllers/                 # Request handlers
│   ├── authController.js        # Authentication logic
│   ├── dashboardController.js   # Dashboard endpoints
│   ├── expenseController.js     # Expense CRUD operations
│   └── incomeController.js      # Income CRUD operations
│
├── middleware/                  # Express middleware
│   ├── authMiddleware.js        # JWT authentication
│   └── uploadMiddleware.js      # File upload handling
│
├── models/                      # Mongoose schemas
│   ├── Expense.js               # Expense model
│   ├── Income.js                # Income model
│   └── User.js                  # User model
│
├── routes/                      # API route definitions
│   ├── authRoutes.js            # /api/auth/*
│   ├── dashboardRoutes.js       # /api/dashboard/*
│   ├── expenseRoutes.js         # /api/expenses/*
│   └── incomeRoutes.js          # /api/income/*
│
├── services/                    # Business logic layer
│   ├── dashboardService.js      # Dashboard data aggregation & caching
│   ├── emailService.js          # Email sending (Nodemailer)
│   ├── expenseService.js        # Expense business logic & caching
│   ├── incomeService.js         # Income business logic & caching
│   ├── messageConsumer.js       # RabbitMQ message consumers
│   ├── messagePublisher.js      # RabbitMQ message publishers
│   ├── otpService.js            # OTP generation & verification
│   └── sessionService.js        # Session management with Redis
│
├── workers/                     # Background workers
│   └── consumer.js              # Standalone RabbitMQ consumer process
│
├── uploads/                     # Uploaded files (receipts/images)
│
├── .env                         # Environment variables
├── .gitignore                   # Git ignore rules
├── docker-compose.yml           # Docker services configuration
├── package.json                 # Dependencies & scripts
├── README.md                    # Documentation
└── server.js                    # Application entry point
```

## Database Schema & ER Diagram

### Entity Relationship Diagram

```
                    ┌──────────────────────────────────────┐
                    │              USER                    │
                    ├──────────────────────────────────────┤
                    │ PK  _id: ObjectId                    │
                    │     fullName: String (required)      │
                    │     email: String (unique, required) │
                    │     phone: String (nullable)         │
                    │     password: String (hashed)        │
                    │     profileImageUrl: String          │
                    │     createdAt: Date                  │
                    │     updatedAt: Date                  │
                    └──────────────┬───────────────────────┘
                                   │
                                   │ 1
                                   │
                                   │ has many
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    │ *                           │ *
                    │                             │
       ┌────────────▼──────────────┐  ┌──────────▼──────────────┐
       │        EXPENSE            │  │         INCOME          │
       ├───────────────────────────┤  ├─────────────────────────┤
       │ PK  _id: ObjectId         │  │ PK  _id: ObjectId       │
       │ FK  userId: ObjectId      │  │ FK  userId: ObjectId    │
       │     icon: String          │  │     icon: String        │
       │     category: String (*)  │  │     source: String (*)  │
       │     amount: Number (*)    │  │     amount: Number (*)  │
       │     date: Date            │  │     date: Date          │
       │     description: String   │  │     createdAt: Date     │
       │     createdAt: Date       │  │     updatedAt: Date     │
       │     updatedAt: Date       │  └─────────────────────────┘
       └───────────────────────────┘
       
       Indexes:
       • userId (indexed)
       • { userId: 1, date: -1 } (compound)
       
       Legend: (*) = Required field
```

### Relationships

- **User → Expense**: One-to-Many (One user can have multiple expenses)
- **User → Income**: One-to-Many (One user can have multiple income records)

### Collection Details

#### Users Collection (`users`)

| Field | Type | Required | Unique | Default | Description |
|-------|------|----------|--------|---------|-------------|
| _id | ObjectId | Yes (auto) | Yes | - | Primary key |
| fullName | String | Yes | No | - | User's full name |
| email | String | Yes | Yes | - | User's email address |
| phone | String | No | No | null | User's phone number |
| password | String | Yes | No | - | Hashed password (bcrypt, 10 rounds) |
| profileImageUrl | String | No | No | null | URL to user's profile image |
| createdAt | Date | Yes (auto) | No | Date.now | Account creation timestamp |
| updatedAt | Date | Yes (auto) | No | Date.now | Last update timestamp |

**Schema Methods:**
- `comparePassword(candidatePassword)` - Compares plain text password with hashed password
- Pre-save hook - Automatically hashes password before saving if modified

**Indexes:**
- email (unique index, auto-created)

---

#### Expenses Collection (`expenses`)

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| _id | ObjectId | Yes (auto) | - | - | Primary key |
| userId | ObjectId | Yes | - | ref: 'User' | Foreign key to User |
| icon | String | No | 💰 | - | Emoji or icon representation |
| category | String | Yes | - | trimmed | Expense category (Food, Rent, etc.) |
| amount | Number | Yes | - | min: 0 | Expense amount (cannot be negative) |
| date | Date | No | Date.now | - | Date of expense |
| description | String | No | - | trimmed | Additional details about expense |
| createdAt | Date | Yes (auto) | Date.now | - | Record creation timestamp |
| updatedAt | Date | Yes (auto) | Date.now | - | Last update timestamp |

**Indexes:**
- userId (single field index)
- { userId: 1, date: -1 } (compound index for efficient queries)

**Common Categories:**
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Others

---

#### Income Collection (`incomes`)

| Field | Type | Required | Default | Validation | Description |
|-------|------|----------|---------|------------|-------------|
| _id | ObjectId | Yes (auto) | - | - | Primary key |
| userId | ObjectId | Yes | - | ref: 'User' | Foreign key to User |
| icon | String | No | - | - | Emoji or icon representation |
| source | String | Yes | - | - | Income source (Salary, Freelance, etc.) |
| amount | Number | Yes | - | - | Income amount |
| date | Date | No | Date.now | - | Date of income |
| createdAt | Date | Yes (auto) | Date.now | - | Record creation timestamp |
| updatedAt | Date | Yes (auto) | Date.now | - | Last update timestamp |

**Common Income Sources:**
- Salary
- Freelance
- Business
- Investments
- Rental Income
- Others

---

### Database Indexes

Indexes are strategically placed for optimal query performance:

1. **User Collection:**
   - `email` (unique) - For authentication and user lookup

2. **Expense Collection:**
   - `userId` (single) - For filtering expenses by user
   - `{ userId: 1, date: -1 }` (compound) - For sorted queries (most recent first)

3. **Income Collection:**
   - `userId` (implicit through ref) - For filtering income by user

### Sample Data Structure

**User Document:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  fullName: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  password: "$2a$10$X1pWZGdM.4MWLkJZmQ1yJO8PvHVZYF9mDZiCzwLdLpKQjGjNjGjNj",
  profileImageUrl: "https://example.com/images/john.jpg",
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}
```

**Expense Document:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  icon: "🍕",
  category: "Food & Dining",
  amount: 45.50,
  date: ISODate("2024-01-20T18:30:00Z"),
  description: "Dinner at Italian restaurant",
  createdAt: ISODate("2024-01-20T19:00:00Z"),
  updatedAt: ISODate("2024-01-20T19:00:00Z")
}
```

**Income Document:**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  icon: "💼",
  source: "Salary",
  amount: 5000.00,
  date: ISODate("2024-01-01T00:00:00Z"),
  createdAt: ISODate("2024-01-01T08:00:00Z"),
  updatedAt: ISODate("2024-01-01T08:00:00Z")
}
```

## RabbitMQ Architecture

### Exchanges
- **expense_exchange** - Topic exchange for expense events
- **income_exchange** - Topic exchange for income events
- **email_exchange** - Topic exchange for email notifications
- **analytics_exchange** - Topic exchange for analytics events

### Queues
- **expense.created** - New expense notifications
- **expense.deleted** - Expense deletion events
- **income.created** - New income notifications
- **income.deleted** - Income deletion events
- **email.notification** - Email sending queue
- **expense.analytics** - Expense analytics processing
- **income.analytics** - Income analytics processing

### Event Flow
```
1. User creates expense
   ↓
2. expenseService saves to MongoDB
   ↓
3. messagePublisher publishes to expense_exchange
   ↓
4. Messages routed to:
   - expense.created queue
   - expense.analytics queue
   ↓
5. Worker consumes messages
   ↓
6. Cache updated, analytics processed
```

## Redis Caching Strategy

### Cache Keys
- `expenses:user:{userId}` - User's expenses list (5 min TTL)
- `income:user:{userId}` - User's income list (5 min TTL)
- `dashboard:user:{userId}` - Dashboard data (5 min TTL)
- `otp:{email}` - OTP codes (10 min TTL)
- `session:{userId}:{sessionId}` - User sessions (1 hour TTL)
- `user_sessions:{userId}` - Active session IDs set
- `stats:expense:{userId}` - Expense statistics (24 hour TTL)
- `stats:income:{userId}` - Income statistics (24 hour TTL)

### Cache Invalidation
Cache is automatically invalidated when:
- Expense created/deleted
- Income created/deleted
- User logs out
- OTP verified

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |

### Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics | Yes |
| GET | `/api/dashboard/summary` | Get financial summary | Yes |

### Expenses
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/expenses` | Get all expenses | Yes |
| POST | `/api/expenses` | Create expense | Yes |
| GET | `/api/expenses/:id` | Get specific expense | Yes |
| PUT | `/api/expenses/:id` | Update expense | Yes |
| DELETE | `/api/expenses/:id` | Delete expense | Yes |

### Income
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/income` | Get all income records | Yes |
| POST | `/api/income` | Create income record | Yes |
| GET | `/api/income/:id` | Get specific income | Yes |
| PUT | `/api/income/:id` | Update income | Yes |
| DELETE | `/api/income/:id` | Delete income | Yes |

## Services Layer

### dashboardService.js
- Aggregates financial data from MongoDB
- Calculates statistics (savings rate, monthly trends)
- Implements Redis caching with 5-minute TTL
- Provides expense/income breakdown by category/source
- Returns recent transactions and analytics

### emailService.js
- Sends OTP emails using Nodemailer
- Gmail SMTP integration
- HTML email templates
- Email delivery confirmation

### expenseService.js
- Business logic for expense operations
- Redis caching for expense lists
- Cache invalidation on create/delete
- RabbitMQ event publishing
- Excel export functionality

### incomeService.js
- Business logic for income operations
- Redis caching for income lists
- Cache invalidation on create/delete
- RabbitMQ event publishing
- Excel export functionality

### messagePublisher.js
- Publishes events to RabbitMQ exchanges
- Initializes exchanges and queues
- Event types: expense created/deleted, income created/deleted, email notifications
- Also publishes analytics events

### messageConsumer.js
- Consumes messages from RabbitMQ queues
- Updates Redis cache
- Processes analytics events
- Sends email notifications
- Retry mechanism (3 attempts)

### otpService.js
- Generates 6-digit OTP codes
- Stores OTP in Redis with 10-minute expiry
- Verifies OTP and deletes on success
- TTL checking for OTP validity

### sessionService.js
- Creates user sessions in Redis
- Verifies active sessions
- Multi-device session support
- Session deletion (single or all devices)
- Tracks device info and last active time

## Worker Process

The `workers/consumer.js` runs as a separate process to handle async message processing:

**Features:**
- Connects to RabbitMQ and Redis
- Starts all message consumers
- Graceful shutdown handling
- Error recovery and logging
- Can be scaled horizontally

**Run worker:**
```bash
node workers/consumer.js
```

## Security Features

- **Password Security:** bcrypt hashing with salt rounds
- **JWT Authentication:** Token-based auth with expiration
- **Session Management:** Redis-based session store
- **Protected Routes:** Middleware authentication
- **NoSQL Injection Prevention:** Mongoose validation
- **CORS:** Configured for cross-origin requests
- **Input Validation:** Request data sanitization
- **File Upload Security:** Multer restrictions
- **Environment Variables:** Sensitive data in .env

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| PORT | Server port | 5000 | No |
| NODE_ENV | Environment | development | No |
| DATABASE_URL | MongoDB URI | - | Yes |
| JWT_SECRET | JWT signing key | - | Yes |
| REDIS_URL | Redis connection URL | redis://localhost:6379 | No |
| RABBITMQ_USER | RabbitMQ username | admin | No |
| RABBITMQ_PASS | RabbitMQ password | admin123 | No |
| RABBITMQ_HOST | RabbitMQ host | localhost | No |
| RABBITMQ_PORT | RabbitMQ port | 5672 | No |
| RABBITMQ_VHOST | RabbitMQ virtual host | expense_tracker | No |
| EMAIL_USER | Gmail address | - | Yes (for OTP) |
| EMAIL_PASS | Gmail app password | - | Yes (for OTP) |

## Docker Services

The `docker-compose.yml` defines three services:

### MongoDB Container
- Image: `mongo:latest`
- Port: `27017`
- Volume: Persistent data storage
- Healthcheck: Connection validation

### Redis Container
- Image: `redis:latest`
- Port: `6379`
- Volume: Persistent data storage
- Healthcheck: PING response

### RabbitMQ Container
- Image: `rabbitmq:3.12-management-alpine`
- Ports: `5672` (AMQP), `15672` (Management UI)
- Volumes: Data and logs persistence
- Default credentials: admin/admin123
- Healthcheck: RabbitMQ diagnostics

## Monitoring & Debugging

### RabbitMQ Management UI
Access at `http://localhost:15672`
- Monitor queues and exchanges
- View message rates
- Check consumer connections

### Redis CLI
```bash
docker exec -it expense_tracker_redis redis-cli
# Check keys
KEYS *
# Get specific key
GET dashboard:user:123
```

### MongoDB Compass
Connect to `mongodb://localhost:27017`
- View collections
- Query data
- Monitor performance

## Performance Optimization

1. **Redis Caching:** 5-minute TTL for frequently accessed data
2. **Database Indexing:** User IDs indexed for fast queries
3. **Aggregation Pipelines:** Efficient MongoDB queries
4. **Message Queue:** Async processing offloaded to workers
5. **Connection Pooling:** MongoDB and Redis connection reuse
6. **Graceful Degradation:** Falls back to database if cache fails

## Error Handling

- **Graceful Fallbacks:** Database fallback when Redis fails
- **Retry Mechanism:** RabbitMQ consumers retry 3 times
- **Error Logging:** Comprehensive console logging
- **Validation:** Input validation at controller level
- **HTTP Status Codes:** Proper status codes for errors

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongodb
# Or on local machine
mongosh --eval "db.adminCommand('ping')"
```

### Redis Connection Issues
```bash
# Check Redis connection
docker exec -it expense_tracker_redis redis-cli ping
# Should return PONG
```

### RabbitMQ Connection Issues
```bash
# Check RabbitMQ status
docker exec -it expense_tracker_rabbitmq rabbitmq-diagnostics ping
# Access management UI
open http://localhost:15672
```

### Worker Not Consuming Messages
- Ensure RabbitMQ is running
- Check worker logs for errors
- Verify queue bindings in RabbitMQ UI
- Restart worker process

### Cache Not Working
- Verify Redis is connected
- Check Redis logs for errors
- Ensure cache keys are correctly formatted

## Common Issues

| Issue | Solution |
|-------|----------|
| Port already in use | Change PORT in .env |
| JWT errors | Verify JWT_SECRET is set |
| Module not found | Run `npm install` |
| Authentication errors | Check JWT token in Authorization header |
| Email not sending | Verify Gmail app password |
| Messages not consumed | Start worker with `node workers/consumer.js` |
| Redis connection failed | Check REDIS_URL in .env |

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## License

This project is licensed under the MIT License.

## Contact

For questions or support, please open an issue in the repository.

## Acknowledgments

- Express.js community
- MongoDB documentation
- RabbitMQ tutorials
- Redis documentation
- Nodemailer documentation
- Docker community
- Node.js ecosystem