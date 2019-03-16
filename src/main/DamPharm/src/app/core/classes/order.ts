import { Customer } from './customer';
import { ProductDetail } from './product-detail';
import { User } from './user';

export class Order {
  id?: number;
  customer_id?: string;
  customer: Customer = new Customer();
  product_id?: string;
  productDetails: ProductDetail[] = [];
  created_at?: Date;
  updated_at?: Date;
  user:User = new User();
}

export class Invoice
{
  order:Order = new Order();
}
