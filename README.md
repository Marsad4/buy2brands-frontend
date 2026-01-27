# ExcelienSparks Wholesale E-Commerce Platform

Frontend for ExcelienSparks wholesale e-commerce platform built with React.

## Features
- Modern, responsive UI with Tailwind CSS
- Product catalog with variants and pack options
- Shopping cart with pack discount calculations
- User authentication and profiles
- Order management
- Admin panel for product and order management
- Real-time updates with Socket.io

## Tech Stack
- React 19
- Tailwind CSS
- Framer Motion for animations
- Axios for API communication
- Socket.io for real-time features

## Getting Started

### Prerequisites
- Node.js v14+
- Backend server running on port 5000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

3. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## API Integration

The frontend communicates with the backend REST API using Axios with JWT authentication. All API calls include the authentication token from localStorage.

### API Services
- `api/auth.api.js` - Authentication (signup, login, logout)
- `api/products.api.js` - Product management
- `api/cart.api.js` - Shopping cart operations
- `api/orders.api.js` - Order management
- `api/users.api.js` - User profile management
- `api/socket.js` - Real-time Socket.io connections

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Runs tests
- `npm eject` - Ejects from Create React App

## Project Structure

```
src/
├── api/                    # API service layer
├── components/             # Reusable components
├── pages/                  # Page components
├── App.js                  # Main app component
└── index.js               # Entry point
```

## License
ISC
