import { Product } from './product';

export class ProductDetail {
  id?: string;
  amount: number;
  discount: number;
  product: Product = new Product();
}
