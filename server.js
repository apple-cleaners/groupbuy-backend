require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Failed:', err.message);
    process.exit(1); // Crash the app if DB connection fails
  });
});

// User Schema
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  address: {
    block: { type: String },
    street: { type: String },
    postalCode: { type: String, match: /^\d{6}$/ },
    hdbTown: { type: String },
    verified: { type: Boolean, default: false }
  },
  phoneVerified: { type: Boolean, default: false }
});

const GroupBuySchema = new mongoose.Schema({
  title: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const User = mongoose.model('User', UserSchema);
const GroupBuy = mongoose.model('GroupBuy', GroupBuySchema);

// Routes
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    const user = new User({ email, password: hashedPassword, name });
    await user.save();
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.send({ user, token });
  } catch (e) {
    res.status(400).send({ error: e.message });
  }
});

app.get('/api/groupbuys', async (req, res) => {
  try {
    const groupBuys = await GroupBuy.find().populate('creator');
    res.send(groupBuys);
  } catch (e) {
    res.status(500).send();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
