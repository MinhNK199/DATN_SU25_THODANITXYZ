export type Category = {
    _id?: string;
    name: string;
    slug?: string;
    description: string;
    image?: string;
    icon?: string;
    color?: string;
    parent?: string | null | Category;
    level?: number;
    isActive: boolean;
    order?: number;
    metaTitle?: string;
    metaDescription?: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: Date | null;
    deletedBy?: string | null;
}; 