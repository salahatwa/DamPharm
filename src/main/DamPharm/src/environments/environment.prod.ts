declare const require: any;
const { name, description, version } = require('../../package.json');

export const environment = {
  production: true,
  api: 'http://localhost:8080/api',
  unauth_api:'http://localhost:8080/unauth',
  name,
  description,
  version
};
