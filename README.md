# Expense Tracker - Backend API

A robust RESTful API built with Node.js, Express, and MongoDB for managing personal expenses and tracking financial transactions.

## Tech Stack

```
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** bcrypt for password hashing
- **File Upload:** Multer middleware
- **ODM:** Mongoose
```

## Features

```
- User authentication and authorization
- Secure JWT-based session management
- Expense tracking and management
- Income tracking and management
- Category-based expense organization
- Dashboard with financial statistics and summaries
- File upload support for receipts and documents
- User-specific data isolation
- Input validation and error handling
- RESTful API architecture
- Excel export functionality for expense data
```

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (MongoDB Compass for GUI management)
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
MONGO_URI=mongodb://localhost:27017/expense_tracker
JWT_SECRET=your_own_jwt_secret_key_here
NODE_ENV=development
```

4. Set up the MongoDB database:

```bash
# Start MongoDB service
# On Windows:
net start MongoDB

# On macOS (using Homebrew):
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# The database and collections will be created automatically when the application starts
```

5. Create an uploads directory (if not present):

```bash
mkdir uploads
```

## Database Schema

The application uses the following MongoDB collections:

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  createdAt: Date (default: current timestamp),
  updatedAt: Date (default: current timestamp)
}
```

### Expenses Collection

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (reference to User),
  title: String (required),
  amount: Number (required),
  category: String (required),
  description: String,
  date: Date (required),
  receipt: String (file path/URL for uploaded receipt),
  createdAt: Date (default: current timestamp),
  updatedAt: Date (default: current timestamp)
}
```

### Income Collection

```javascript
{
  _id: ObjectId,
  user_id: ObjectId (reference to User),
  title: String (required),
  amount: Number (required),
  source: String (required),
  description: String,
  date: Date (required),
  createdAt: Date (default: current timestamp),
  updatedAt: Date (default: current timestamp)
}
```

## Project Structure

```
backend/
├── config/                   # Configuration files
│   └── db.js                 # MongoDB database connection configuration
├── controllers/              # Business logic handlers
│   ├── authController.js     # Handles authentication logic (login, register, token generation)
│   ├── desktopController.js  # Handles desktop-specific operations
│   ├── expenseController.js  # Manages expense operations (create, read, update, delete expenses)
│   └── incomeController.js   # Manages income operations (create, read, update, delete income)
├── middleware/               # Express middleware functions
│   ├── authMiddleware.js     # Authentication and authorization middleware (JWT validation)
│   └── uploadMiddleware.js   # File upload handling middleware
├── models/                   # MongoDB/Mongoose models
│   ├── Expense.js            # Expense schema and model
│   ├── Income.js             # Income schema and model
│   └── User.js               # User schema and model
├── node_modules/             # Project dependencies (installed via npm)
├── routes/                   # API route definitions
│   ├── authRoutes.js         # Routes for authentication endpoints (/api/auth/*)
│   ├── dashboardRoutes.js    # Routes for dashboard data endpoints (/api/dashboard/*)
│   ├── dashboardRoutes.js    # Duplicate dashboard routes file
│   ├── expenseRoutes.js      # Routes for expense endpoints (/api/expenses/*)
│   └── incomeRoutes.js       # Routes for income endpoints (/api/income/*)
├── uploads/                  # Directory for uploaded files
│   └── [uploaded images]     # User-uploaded expense/income receipts and images
├── .env                      # Environment variables (database credentials, JWT secret, ports)
├── .gitignore                # Git ignore file
├── expense_details.xlsx      # Excel file for expense data (possibly for import/export)
├── package-lock.json         # Locked versions of npm dependencies
├── package.json              # Project dependencies and scripts
├── README.md                 # Project documentation
└── server.js                 # Main application entry point (server setup and configuration)
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
| MONGO_URI | MongoDB connection string | mongodb://localhost:27017/expense_tracker |
| JWT_SECRET | Secret key for JWT signing | your_secret_key_here |
| NODE_ENV | Application environment | development/production |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (protected)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (protected)
- `GET /api/dashboard/summary` - Get financial summary (protected)

### Expenses
- `GET /api/expenses` - Get all user expenses (protected)
- `POST /api/expenses` - Create new expense (protected)
- `GET /api/expenses/:id` - Get specific expense (protected)
- `PUT /api/expenses/:id` - Update expense (protected)
- `DELETE /api/expenses/:id` - Delete expense (protected)

### Income
- `GET /api/income` - Get all user income records (protected)
- `POST /api/income` - Create new income record (protected)
- `GET /api/income/:id` - Get specific income record (protected)
- `PUT /api/income/:id` - Update income record (protected)
- `DELETE /api/income/:id` - Delete income record (protected)

## Security Features

- Password encryption using bcrypt with salt rounds
- JWT-based authentication with expiration
- Protected routes with middleware
- NoSQL injection prevention through Mongoose validation
- CORS configuration
- Input validation and sanitization
- File upload restrictions and validation
- Secure file storage for receipts and documents

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
- MongoDB documentation
- Mongoose ODM documentation
- Multer documentation
- JWT documentation
- Node.js community

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB service is running
- Check if the MONGO_URI in .env is correct
- Verify MongoDB is accessible on the specified port (default: 27017)

### File Upload Issues
- Ensure the `uploads` directory exists and has proper write permissions
- Check file size limits in the upload middleware
- Verify supported file types are configured correctly

### Common Issues
- **Port already in use:** Change the PORT in .env file
- **JWT errors:** Ensure JWT_SECRET is set in .env
- **Module not found:** Run `npm install` to install all dependencies
- **Authentication errors:** Verify JWT token is being sent in Authorization header