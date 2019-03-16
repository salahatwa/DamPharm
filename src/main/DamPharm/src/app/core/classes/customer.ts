import { User } from "./user";

export class Customer {
  id?: string;
  full_name: string = '';
  company_name: string = null;
  email: string = null;
  address: string = null;
  postal_code: string = null;
  city: string = null;
  country: string = null;
  state: string = null;
  phone:string =null;

  user:User = new User();
}
