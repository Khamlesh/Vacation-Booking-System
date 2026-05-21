const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

// ═══════════════════════════════════════════════════════════════════════════════
//  ALL SPECIFIC STRING ROUTES MUST COME BEFORE ANY /:id WILDCARD ROUTES
// ═══════════════════════════════════════════════════════════════════════════════

// ── Profile routes ─────────────────────────────────────────────────────────────

// GET own profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update own profile (name, email, phone, address)
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.email !== undefined) user.email = req.body.email;
    if (req.body.contactPhone !== undefined) user.contactPhone = req.body.contactPhone;
    if (req.body.address !== undefined) user.address = req.body.address;

    if (req.body.password) {
      user.password = req.body.password;
    }

    await user.save();
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      contactPhone: user.contactPhone,
      address: user.address,
      role: user.role,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Wishlist routes ─────────────────────────────────────────────────────────────

// GET wishlist (populated listings)
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST toggle wishlist
router.post('/wishlist/:listingId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { listingId } = req.params;
    const alreadySaved = user.wishlist.some(id => id.toString() === listingId);
    if (alreadySaved) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== listingId);
    } else {
      user.wishlist.push(listingId);
    }
    await user.save();
    res.json(user.wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Password Reset ─────────────────────────────────────────────────────────────

router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ error: 'Please provide email and new password' });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═══════════════════════════════════════════════════════════════════════════════
//  ADMIN ROUTES — specific named paths before /:id wildcard
// ═══════════════════════════════════════════════════════════════════════════════

// GET all users
router.get('/', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all pending host requests
router.get('/pending-hosts', protect, admin, async (req, res) => {
  try {
    const hosts = await User.find({ role: 'host', status: 'pending' }).select('-password');
    res.json(hosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT approve a host
router.put('/approve-host/:id', protect, admin, async (req, res) => {
  try {
    const host = await User.findById(req.params.id);
    if (!host) return res.status(404).json({ error: 'User not found' });
    host.status = 'active';
    await host.save();
    res.json({ message: 'Host account approved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE reject a host
router.delete('/reject-host/:id', protect, admin, async (req, res) => {
  try {
    const host = await User.findById(req.params.id);
    if (!host) return res.status(404).json({ error: 'User not found' });
    await host.deleteOne();
    res.json({ message: 'Host account request rejected and deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update user role (admin only)
router.put('/:id/role', protect, admin, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Admin cannot change their own role from this interface' });
    }
    const { role } = req.body;
    const allowedRoles = ['user', 'host', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role selected' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.role = role;
    await user.save();
    res.json({ message: 'User role updated', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update any user details (admin only) — MUST be after all specific PUT routes
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.name = name || user.name;
    user.email = email || user.email;
    if (role && req.user.id !== req.params.id) {
      user.role = role;
    }
    await user.save();
    res.json({ message: 'User details updated', user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE a user (admin only) — MUST be last
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ error: 'Admin cannot delete their own account from this interface' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
