import { RequestOptions, Headers } from '@angular/http';

const createDefaultHeaders = function (params?: any, ismultipart?: boolean) {

  let defaultHeaders = { 'Content-Type': 'application/json' };;
  if (ismultipart)
    defaultHeaders = null;

  const tokenHeader = { 'Authorization': localStorage.getItem('oatoken') };
  const headers = Object.assign({}, defaultHeaders, tokenHeader);


  let options = new RequestOptions({
    headers: new Headers(headers)
  });

  options.params = params;


  return options;
};


export const REQUEST_OPTIONS_DEFAULT: Function = createDefaultHeaders;