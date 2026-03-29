export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  stock: number;
  imageUrl: string;
  categoryId: number;
  categoryName: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  imageFile?: File;
  categoryId: number;
}
