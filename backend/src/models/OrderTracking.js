import mongoose from 'mongoose';

const orderTrackingSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  shipperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shipper',
    required: true
  },
  status: {
    type: String,
    enum: [
      'assigned',      // Đã phân công
      'picked_up',     // Đã nhận hàng
      'in_transit',    // Đang giao hàng
      'arrived',       // Đã đến điểm giao
      'delivered',     // Đã giao hàng
      'failed',        // Giao hàng thất bại
      'cancelled'      // Hủy giao hàng
    ],
    default: 'assigned'
  },
  pickupImages: [{
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  deliveryImages: [{
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  pickupTime: {
    type: Date,
    default: null
  },
  transitStartTime: {
    type: Date,
    default: null
  },
  arrivedTime: {
    type: Date,
    default: null
  },
  deliveryTime: {
    type: Date,
    default: null
  },
  estimatedDeliveryTime: {
    type: Date,
    default: null
  },
  actualDeliveryTime: {
    type: Date,
    default: null
  },
  notes: {
    type: String,
    default: ''
  },
  failureReason: {
    type: String,
    default: null
  },
  customerSignature: {
    type: String, // Base64 encoded signature
    default: null
  },
  deliveryProof: {
    type: String, // Additional proof of delivery
    default: null
  },
  locationUpdates: [{
    latitude: Number,
    longitude: Number,
    address: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  autoConfirmAt: {
    type: Date,
    default: null // Thời gian tự động xác nhận đơn hàng
  }
}, {
  timestamps: true
});

// Index for better performance
orderTrackingSchema.index({ orderId: 1 });
orderTrackingSchema.index({ shipperId: 1 });
orderTrackingSchema.index({ status: 1 });
orderTrackingSchema.index({ autoConfirmAt: 1 });

export default mongoose.model('OrderTracking', orderTrackingSchema);
