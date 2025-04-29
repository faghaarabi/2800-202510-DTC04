const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const cors = require('cors');
const helmet = require('helmet'); // Added for security
const morgan = require('morgan'); // Added for enhanced logging

// Near the top of server.js
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Ensure you can find views in the correct directory
app.set('views', './views');

// Connect to Database
connectDB();

// Comprehensive CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || 
            origin === 'http://localhost:3000' || 
            origin === 'http://127.0.0.1:3000') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Logging middleware
app.use(morgan('dev')); // Detailed request logging

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// Middleware
app.use(express.json({
    limit: '10kb' // Limit payload size
}));
app.use(express.urlencoded({ 
    extended: true,
    limit: '10kb' // Limit payload size
}));

// Static file serving with some security
app.use(express.static(path.join(__dirname, 'public'), {
    setHeaders: (res, path) => {
        // Prevent directory listing
        if (path.endsWith('/')) {
            res.setHeader('X-Content-Type-Options', 'nosniff');
        }
    }
}));

// Rate limiting middleware (basic)
const rateLimit = require('express-rate-limit');
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', apiLimiter);

// Import routes
const userRoutes = require('./routes/userRoutes');
const connectionRoutes = require('./routes/connectionRoutes');

// Detailed request logging
app.use((req, res, next) => {
    console.log('Request Details:');
    console.log('Method:', req.method);
    console.log('Path:', req.path);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));
    next();
});

// View routes
app.get('/register', (req, res) => {
    res.render('register', { 
        title: 'Register',
        error: null 
    });
});

app.get('/login', (req, res) => {
    res.render('login', { 
        title: 'Login',
        error: null 
    });
});

// Profile route with error handling
app.get('/profile', (req, res, next) => {
    try {
        // You might want to add some authentication check here
        res.render('profile', { 
            title: 'User Profile' 
        });
    } catch (error) {
        next(error);
    }
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/connections', connectionRoutes);

// 404 handler with more informative response
app.use((req, res, next) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
        requestedUrl: req.originalUrl
    });
});

// Comprehensive error handling middleware
app.use((err, req, res, next) => {
    // Log the error
    console.error('Unhandled Error:', err);

    // Determine status code
    const statusCode = err.status || err.statusCode || 500;

    // Respond with error details (avoid exposing sensitive info in production)
    res.status(statusCode).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : err.message,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    });
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully');
    app.close(() => {
        console.log('Process terminated');
    });
});

// Port configuration
const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export for potential testing
module.exports = server;