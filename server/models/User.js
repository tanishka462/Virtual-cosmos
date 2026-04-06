const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  socketId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatarColor: { type: String, default: '#7c3aed' },
  position: {
    x: { type: Number, default: 400 },
    y: { type: Number, default: 300 }
  },
  isOnline: { type: Boolean, default: true },
  connectedWith: [{ type: String }], // array of socketIds
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
