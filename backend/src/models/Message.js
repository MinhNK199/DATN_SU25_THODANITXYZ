import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system', 'auto_reply'],
    default: 'text'
  },
  attachments: [{
    filename: String,
    originalName: String,
    url: String,
    size: Number,
    mimeType: String
  }],
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  metadata: {
    // For system messages
    systemType: {
      type: String,
      enum: ['conversation_started', 'conversation_closed', 'user_joined', 'user_left', 'admin_assigned']
    },
    // For auto-reply messages
    autoReplyTrigger: String,
    // For file messages
    fileInfo: {
      originalName: String,
      size: Number,
      mimeType: String
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ type: 1 });
messageSchema.index({ status: 1 });

// Method to check if message is read by specific user
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(read => read.user.toString() === userId.toString());
};

// Method to mark message as read by user
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to get unread count for user
messageSchema.statics.getUnreadCount = function(conversationId, userId) {
  return this.countDocuments({
    conversation: conversationId,
    sender: { $ne: userId },
    readBy: { $not: { $elemMatch: { user: userId } } },
    isDeleted: false
  });
};

// Pre-save middleware to update conversation's lastMessage
messageSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Conversation = mongoose.model('Conversation');
      await Conversation.findByIdAndUpdate(
        this.conversation,
        {
          lastMessage: this._id,
          lastMessageAt: this.createdAt || new Date()
        }
      );
    } catch (error) {
      console.error('Error updating conversation lastMessage:', error);
    }
  }
  next();
});

export default mongoose.model('Message', messageSchema);
