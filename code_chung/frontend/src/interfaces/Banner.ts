export interface Banner {
  _id?: string;
  title: string;
  image: {
    url: string;
    alt?: string;
    publicId?: string;
  };
  link?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  position: string;
  createdAt?: Date;
  updatedAt?: Date;
}