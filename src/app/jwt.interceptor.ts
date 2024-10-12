import { HttpEvent, HttpHandler, HttpRequest, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';


export const JwtInterceptor: HttpInterceptorFn = (request, next) => {
  const token = localStorage.getItem('jwt_token');
  console.log("JWT INTECEPTOR: " + token);

  if(token){
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }
  return next(request);
}

