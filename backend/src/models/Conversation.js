import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  type: {
    type: String,
    enum: ['customer_support', 'general', 'admin_broadcast'],
    default: 'customer_support'
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'pending', 'resolved'],
    default: 'active'
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  subject: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String
  }],
  metadata: {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    customerInfo: {
      name: String,
      email: String,
      phone: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
conversationSchema.index({ participants: 1 });
conversationSchema.index({ status: 1 });
conversationSchema.index({ lastMessageAt: -1 });
conversationSchema.index({ assignedTo: 1 });

// Virtual for getting customer and admin
conversationSchema.virtual('customer').get(function() {
  return this.participants.find(p => p.role === 'customer');
});

conversationSchema.virtual('admin').get(function() {
  return this.participants.find(p => p.role === 'admin' || p.role === 'superadmin');
});

// Method to check if user is participant
conversationSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.toString() === userId.toString());
};

// Method to get other participant
conversationSchema.methods.getOtherParticipant = function(userId) {
  return this.participants.find(p => p.toString() !== userId.toString());
};

export default mongoose.model('Conversation', conversationSchema);
