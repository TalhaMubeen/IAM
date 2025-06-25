# IAM System

A comprehensive Identity and Access Management (IAM) system built with Node.js, Express, SQLite, and React.

## Features

- User authentication and authorization
- Role-based access control (RBAC)
- Group management
- Module and permission management
- JWT-based authentication
- SQLite database
- React frontend with Redux
- Tailwind CSS for styling

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Project Structure

```
.
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── hooks/        # React hooks
│   │   ├── layouts/      # React layouts
│   │   ├── pages/        # Page components
│   │   ├── services/     # services
│   │   ├── store/        # Redux store and slices
│   │   └── App.js        # Main application component
│   └── package.json
└── server/                # Node.js backend
    ├── src/
    │   ├── config/       # Configuration files
    │   ├── controllers/  # Controllers
    │   ├── middleware/   # Express middleware
    │   ├── routes/       # API routes
    │   ├── seed/         # Database seeding
    │   ├── services/     # Services
    │   ├── validators/     # Validators
    │   └── app.js        # Express application
    │   └── server.js        # Express Server
    └── package.json
```

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd iam-system
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Create environment files:
   - Create `.env` in the server directory:
     ```
      NODE_ENV=development
      PORT=3000
      DB_PATH=:memory:
      JWT_SECRET=dev-secret-key
      JWT_EXPIRES_IN=24h
      CORS_ORIGIN=http://localhost:3001
      RATE_LIMIT_WINDOW_MS=1000
      RATE_LIMIT_MAX_REQUESTS=100
      LOG_LEVEL=debug
      BCRYPT_SALT_ROUNDS=10
      ADMIN_USERNAME=admin
      ADMIN_PASSWORD=Admin@123
      ADMIN_EMAIL=admin@admin.com
     ```

4. Initialize the database:
   ```bash
   cd server
   npm run seed
   ```

5. Start the development servers:
   ```bash
   # Start the backend server
   cd server
   npm run dev

   # Start the frontend development server
   cd ../client
   npm start
   ```

## Development

### Frontend Development

- Run tests:
  ```bash
  cd client
  npm test
  ```

- Run linting:
  ```bash
  npm run lint
  ```

## API Documentation

The API documentation is available at `/api-docs` when running the server.

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention
- XSS protection

## License

This project is licensed under the MIT License - see the LICENSE file for details. 