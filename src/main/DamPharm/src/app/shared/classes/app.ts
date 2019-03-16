import { environment } from '../../../environments/environment';

export class Config {
  name: string = environment.name;
  description: string = environment.description;
  version: string = environment.version;
  api: string = environment.api;
  unauth_api:string=environment.unauth_api;
}
