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

### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Expenses Table
```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
├── middleware/
│   └── authMiddleware.js     # JWT verification middleware
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   └── expenseRoutes.js      # Expense routes
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

## API Endpoints

### Authentication Routes

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securePassword123"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "securePassword123"
}
```

**Response:**
```json
{
    "token": "jwt_token_here",
    "user": {
        "id": 1,
        "username": "johndoe",
        "email": "john@example.com"
    }
}
```

### Expense Routes (Protected)

All expense routes require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### Get All Expenses
```http
GET /api/expenses
```

#### Get Single Expense
```http
GET /api/expenses/:id
```

#### Create Expense
```http
POST /api/expenses
Content-Type: application/json

{
    "description": "Grocery shopping",
    "amount": 45.50,
    "category": "Food",
    "date": "2024-01-15"
}
```

#### Update Expense
```http
PUT /api/expenses/:id
Content-Type: application/json

{
    "description": "Updated description",
    "amount": 50.00,
    "category": "Food",
    "date": "2024-01-15"
}
```

#### Delete Expense
```http
DELETE /api/expenses/:id
```

#### Get Expenses by Category
```http
GET /api/expenses/category/:category
```

#### Get Expenses Summary
```http
GET /api/expenses/summary
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

## Dependencies

```json
{
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "dotenv": "^16.0.3",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "cors": "^2.8.5",
    "express-validator": "^7.0.1"
}
```

### Dev Dependencies
```json
{
    "nodemon": "^3.0.1"
}
```

## Security Features

- Password encryption using bcrypt
- JWT-based authentication
- Protected routes with middleware
- SQL injection prevention through parameterized queries
- CORS configuration
- Input validation and sanitization

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error



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