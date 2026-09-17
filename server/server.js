/**
 * Application entry point.
 * Boots the Express server, connects MongoDB, and wires all routes.
 * @module server
 */
require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const visitorRoutes = require('./routes/visitorRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const billRoutes = require('./routes/billRoutes');

const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Connect to MongoDB.
connectDB();

const app = express();

// Global middleware.
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded visitor photos as static files.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes.
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/visitors', visitorRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/bills', billRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Error handling (must be registered last).
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));