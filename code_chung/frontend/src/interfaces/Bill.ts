export interface BillItem {
    product: string | { _id: string; name: string; price: number }; // MongoDB ObjectId as string or populated object
    quantity: number;
    price: number;
}

export type BillStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'shipping' | 'delivering' | 'delivered' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Customer {
    _id: string;
    name: string;
    email: string;
}

export interface Bill {
    _id?: string;
    billNumber: string;
    customer: string | Customer; // MongoDB ObjectId as string or populated Customer object
    items: BillItem[];
    totalAmount: number;
    status: BillStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
