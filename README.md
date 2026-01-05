# Expense Tracker - Backend API

A robust RESTful API built with Node.js, Express, and PostgreSQL for managing personal expenses and tracking financial transactions.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcrypt for password hashing

## Features

- User authentication and authorization
- Secure JWT-based session management
- CRUD operations for expense tracking
- Category-based expense management
- User-specific data isolation
- Input validation and error handling
- RESTful API architecture

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
DATABASE_URL=postgresql://username:password@localhost:5432/expense_tracker
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
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
├── config/
│   └── db.js                 # Database configuration
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── expenseController.js  # Expense CRUD operations
|   |__ transactionContoller.js 
├── middleware/
│   └── authMiddleware.js     # JWT verification middleware
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   └── expenseRoutes.js      # Expense routes
|   |__ transactionRoutes.js  # Transaction routes
├── models/
│   ├── userModel.js          # User database queries
│   └── expenseModel.js       # Expense database queries
├── utils/
│   └── validation.js         # Input validation helpers
├── .env                      # Environment variables
├── .gitignore
├── server.js                 # Application entry point
└── package.json
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