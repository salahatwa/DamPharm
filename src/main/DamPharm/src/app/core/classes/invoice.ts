
export class Invoice
{
 billFrom:BillFrom=new BillFrom();
 billTo:BillTo=new BillTo();
 billProduct:BillDetail[]=[];
 billTotal:BillTotal;
}

export class BillFrom{
  name:String='';
  email:string;
  phone:string;
  company:string;
  address:string;
  state:string;
  city:string;
  website:string;
 }

 export class BillTo{
  name:string;
  phone:string;
  company:string;
  address:string;
  state:string;
  city:string;
 }

export class BillDetail
{
  line:string;
  billNum:number;
  productName:string;
  productQty:string;
  productUnitPrice:string;
  productAmount:string;
  productDiscount:string;
  productAmountAfterDiscount:string;
}
export class BillTotal
{
  subtotal:string;
  other:string;
  total:string;

  billNum:number;
  createdAt:string;
  description:string;

  commentTitle:string;
  comment1:string;
  comment2:string;
}