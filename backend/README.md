# Expense Tracker - Backend API

A robust RESTful API built with Node.js, Express, and PostgreSQL for managing personal expenses and tracking financial transactions.

## Tech Stack
 ```
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcrypt for password hashing
```

## Features
```
- User authentication and authorization
- Secure JWT-based session management
- CRUD operations for expense tracking
- Category-based expense management
- User-specific data isolation
- Input validation and error handling
- RESTful API architecture
```

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```env
PORT=5000
DATABASE_URL=Add your own url 
JWT_SECRET=your_our_own_jwt_secret_key_here
NODE_ENV=development / deployment 
```

4. Set up the PostgreSQL database:
```bash
# Log into PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE expense_tracker;

# Connect to the database
\c expense_tracker

# Run the schema (if you have a schema.sql file)
\i schema.sql
```

## Database Schema

The application uses the following main tables:

```sql
CREATE TABLE tbluser (
	id SERIAL NOT NULL PRIMARY KEY,
	email VARCHAR(120) UNIQUE NOT NULL,
	firstName VARCHAR(50) NOT NULL,
	lastName VARCHAR(50),
	contact VARCHAR(15),
	accounts TEXT[],
	password TEXT,
	provider VARCHAR(10) NULL,
	country TEXT,
	currency VARCHAR(5) NOT NULL DEFAULT 'USD',
	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tblaccount (
	id SERIAL NOT NULL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES tbluser(id),
	account_name VARCHAR(50) NOT NULL,
	account_number VARCHAR(50) NOT NULL,
	account_balance NUMERIC(10, 2) NOT NULL,
	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbltransaction(
	id SERIAL NOT NULL PRIMARY KEY,
	user_id INTEGER NOT NULL REFERENCES tbluser(id),
	description TEXT NOT NULL,
	status VARCHAR(10) NOT NULL DEFAULT 'Pending',
	source VARCHAR(100) NOT NULL,
	amount NUMERIC(10, 2) NOT NULL,
	type VARCHAR(10) NOT NULL DEFAULT 'income',
	createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

## Project Structure

```
backend/
├── controllers/                    # Business logic handlers
│   ├── accountController.js       # Handles account-related operations (create, read, update, delete accounts)
│   ├── authController.js          # Handles authentication logic (login, register, token generation)
│   ├── transactionController.js   # Manages transaction operations (create, read transactions)
│   └── userController.js          # Handles user-related operations (profile, user management)
├── libs/                          # Library and utility files
│   ├── database.js                # Database connection configuration and setup
│   └── index.js                   # Exports all library modules
├── middleware/                    # Express middleware functions
│   └── authMiddleware.js          # Authentication and authorization middleware (JWT validation)
├── routes/                        # API route definitions
│   ├── accountRoutes.js           # Routes for account endpoints (/api/accounts/*)
│   ├── authRoutes.js              # Routes for authentication endpoints (/api/auth/*)
│   ├── index.js                   # Combines all routes into main router
│   ├── transactionRoutes.js       # Routes for transaction endpoints (/api/transactions/*)
│   └── userRoutes.js              # Routes for user endpoints (/api/users/*)
├── .env                           # Environment variables (database credentials, JWT secret, ports)
├── index.js                       # Main application entry point (server setup and configuration)
├── package-lock.json              # Locked versions of npm dependencies
├── package.json                   # Project dependencies and scripts
├── script.sql                     # Database schema and initialization scripts
└── test.js                        # Test files for API endpoints
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your .env file).

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port number | 5000 |
| DATABASE_URL | PostgreSQL connection string | postgresql://user:pass@localhost:5432/db |
| JWT_SECRET | Secret key for JWT signing | your_secret_key_here |
| NODE_ENV | Application environment | development/production |

## Security Features

- Password encryption using bcrypt
- JWT-based authentication
- Protected routes with middleware
- SQL injection prevention through parameterized queries
- CORS configuration
- Input validation and sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Contact

For any questions or support, please open an issue in the repository.

## Acknowledgments

- Express.js documentation
- PostgreSQL documentation
- JWT documentation
- Node.js community

Rate limite 
Redis for password of user password changeing 