const mongoose = require('mongoose');

const AdminLogSchema = new mongoose.Schema({
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  targetGig: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AdminLog', AdminLogSchema);
