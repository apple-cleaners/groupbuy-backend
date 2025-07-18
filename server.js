require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); // ← Only declared once here

const app = express();

// Middleware (use cors only once)
app.use(express.json());
app.use(cors()); // ← Only used once here

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    // Replace with your actual registration logic
    res.json({ success: true, message: "Registration successful!" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Test endpoints:
  - Health: http://localhost:${PORT}/health
  - Register: http://localhost:${PORT}/api/register`);
});
