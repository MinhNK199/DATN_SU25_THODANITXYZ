export interface BillItem {
    product: string; // MongoDB ObjectId as string
    quantity: number;
    price: number;
}

export type BillStatus = 'pending' | 'confirmed' | 'ready_for_pickup' | 'shipping' | 'delivering' | 'delivered' | 'paid' | 'cancelled';
export type PaymentMethod = 'cash' | 'credit_card' | 'bank_transfer';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded';

export interface Bill {
    _id?: string;
    billNumber: string;
    customer: string; // MongoDB ObjectId as string
    items: BillItem[];
    totalAmount: number;
    status: BillStatus;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    createdAt?: Date;
    updatedAt?: Date;
}
