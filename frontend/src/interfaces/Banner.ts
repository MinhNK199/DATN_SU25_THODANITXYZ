export interface Banner {
  _id?: string;
  title: string;
  subtitle?: string;
  description?: string;
  buttonText?: string;
  buttonLink?: string;
  badge?: string;
  features: string[];
  image: string;
  startDate?: string ;
  endDate?: string | null;
  isActive?: boolean;
  position?: string;
  createdAt?: string;
  updatedAt?: string;
}
