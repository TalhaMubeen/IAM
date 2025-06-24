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
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── store/        # Redux store and slices
│   │   └── App.js        # Main application component
│   └── package.json
└── server/                # Node.js backend
    ├── src/
    │   ├── config/       # Configuration files
    │   ├── middleware/   # Express middleware
    │   ├── routes/       # API routes
    │   ├── seed/         # Database seeding
    │   └── app.js        # Express application
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
     JWT_SECRET=your-secret-key
     JWT_EXPIRES_IN=24h
     DB_PATH=./data/iam.db
     CORS_ORIGIN=http://localhost:3000
     RATE_LIMIT_WINDOW_MS=900000
     RATE_LIMIT_MAX_REQUESTS=100
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

### Backend Development

- Run tests:
  ```bash
  cd server
  npm test
  ```

- Run linting:
  ```bash
  npm run lint
  ```

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

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 