const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  contactPhone: { type: String },
  address: { type: String },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'host'], default: 'user' },
  status: { type: String, enum: ['active', 'pending', 'rejected'], default: 'active' },
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }]
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(cand) {
  return bcrypt.compare(cand, this.password);
};

module.exports = mongoose.model('User', userSchema);
