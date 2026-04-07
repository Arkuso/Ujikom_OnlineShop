export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  stock: number;
  imageUrl: string;
  imageUrl2?: string;
  imageUrl3?: string;
  imageUrl4?: string;
  specifications?: string; // JSON string
  categoryId: number;
  categoryName: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageFiles?: File[];
  specifications?: string; // JSON string
  categoryId: number;
}
