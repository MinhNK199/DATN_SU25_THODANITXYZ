import mongoose from 'mongoose';

const shipperSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  idCard: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  licensePlate: {
    type: String,
    required: true,
    trim: true
  },
  vehicleType: {
    type: String,
    enum: ['motorbike', 'car', 'bicycle'],
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: null
  },
  documents: [{
    type: {
      type: String,
      enum: ['id_card', 'driver_license', 'vehicle_registration', 'insurance']
    },
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastActiveAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better performance
shipperSchema.index({ email: 1 });
shipperSchema.index({ username: 1 });
shipperSchema.index({ status: 1 });
shipperSchema.index({ isOnline: 1 });

export default mongoose.model('Shipper', shipperSchema);
