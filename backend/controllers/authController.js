const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    console.log('Registration Request Body:', req.body);
    const { name, email, password, role, contactPhone } = req.body;
    try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    const normalizedRole = role ? role.toLowerCase().trim() : 'user';
    let finalStatus = 'active';
    if (normalizedRole === 'host') {
      finalStatus = 'pending';
    }
    
    console.log(`Registering user: ${email}, Role: ${normalizedRole}, Calculated Status: ${finalStatus}`);
    
    const user = new User({ 
      name, 
      email, 
      password, 
      role: normalizedRole, 
      contactPhone, 
      status: finalStatus 
    });
    
    await user.save();
    
    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        contactPhone: user.contactPhone,
        role: user.role,
        status: user.status,
        token: user.status === 'active' ? generateToken(user._id, user.role) : null
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      if (user.status === 'pending') {
        return res.status(403).json({ error: 'Your host account is pending administrator approval. Please wait for verification.' });
      }
      if (user.status === 'rejected') {
        return res.status(403).json({ error: 'Your host account request was declined. Please contact support for details.' });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        contactPhone: user.contactPhone,
        role: user.role,
        status: user.status,
        token: generateToken(user._id, user.role)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password').populate('wishlist');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
