import { User } from "./user";
import { Customer } from "./customer";
import { Product } from "./product";
import { PageParam } from "./ParamInterfaces";

class DateRange {
  from: string = null;
  to: string = null;
}

export class BaseFilter extends PageParam{
  created_at: DateRange = new DateRange();
}

export class ProductFilter extends BaseFilter {
  sku: string = null;
  name: string = null;
  type: any = null;
  user:User = new User() ;
}

export class CustomerFilter extends BaseFilter {
  full_name: string = null;
  company_name: string = null;
  city: string = null;
  country: string = null;
  user:User = new User() ;
}

export class OrderFilter extends BaseFilter {
  id: number = null;
  product:Product=new Product();
  customer:Customer=new Customer();
  user:User = new User() ;
}
