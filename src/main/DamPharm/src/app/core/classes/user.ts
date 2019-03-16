import { Company } from './company';

export class User {
  id: string = '';
  username: String = '';
  email: string = ' ';
  oldpassword: string = '';
  newpassword?: string = '';
  password?: string = '';
  phone:string='';
  city:string='';
  state:string='';
  website:string='';
  address:string='';
  company?: Company = new Company();
}

export interface AuthenticationResponse
{
  token:string;
  authorities:string[];
}
