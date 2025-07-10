export interface Order {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    orderItems: {
        name: string;
        quantity: number;
        image: string;
        price: number;
        product: string;
    }[];
    shippingAddress: {
        fullName: string;
        address: string;
        city: string;
        postalCode: string;
        phone: string;
    };
    paymentMethod: 'COD' | 'BANKING' | 'E-WALLET';
    paymentResult?: {
        id: string;
        status: string;
        update_time: string;
        email_address: string;
    };
    itemsPrice: number;
    taxPrice: number;
    shippingPrice: number;
    totalPrice: number;
    coupon?: string;
    discountAmount: number;
    isPaid: boolean;
    paidAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    statusHistory: {
        status: string;
        date: string;
        note?: string;
    }[];
    createdAt: string;
    updatedAt: string;
} 