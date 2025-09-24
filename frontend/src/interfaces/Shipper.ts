export interface Shipper {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  address: string;
  idCard: string;
  licensePlate: string;
  vehicleType: 'motorbike' | 'car' | 'bicycle';
  status: 'active' | 'inactive' | 'suspended';
  isOnline: boolean;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  rating: number;
  totalDeliveries: number;
  currentOrders?: number;
  avatar?: string;
  documents: Array<{
    type: 'id_card' | 'driver_license' | 'vehicle_registration' | 'insurance';
    url: string;
    uploadedAt: string;
  }>;
  lastActiveAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderTracking {
  _id: string;
  orderId: string;
  shipperId: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  pickupImages: Array<{
    url: string;
    uploadedAt: string;
    description: string;
  }>;
  deliveryImages: Array<{
    url: string;
    uploadedAt: string;
    description: string;
  }>;
  pickupTime?: string;
  deliveryTime?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  notes: string;
  failureReason?: string;
  customerSignature?: string;
  deliveryProof?: string;
  locationUpdates: Array<{
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  }>;
  autoConfirmAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShipperAuthResponse {
  success: boolean;
  message: string;
  data: {
    shipper: Shipper;
    token: string;
  };
}

export interface ShipperProfileResponse {
  success: boolean;
  data: {
    shipper: Shipper;
  };
}

export interface AssignedOrdersResponse {
  success: boolean;
  data: {
    orders: Array<Order & {
      user: {
        _id: string;
        fullName: string;
        phone: string;
        email: string;
      };
      orderTracking?: OrderTracking;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}
