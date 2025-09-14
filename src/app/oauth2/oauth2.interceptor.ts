import { HttpEvent, HttpHandler, HttpRequest, HttpInterceptorFn } from '@angular/common/http';
import { Observable } from 'rxjs';

export const OAuth2Interceptor: HttpInterceptorFn = (request, next) => {
  // Check for OAuth2 access token first
  const oauth2Token = localStorage.getItem('oauth2_access_token');
  
  if (oauth2Token) {
    // Add OAuth2 Bearer token
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${oauth2Token}`,
        'X-Auth-Type': 'oauth2'
      }
    });
  } else {
    // Fall back to JWT token if no OAuth2 token
    const jwtToken = localStorage.getItem('jwt_token');
    if (jwtToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${jwtToken}`,
          'X-Auth-Type': 'jwt'
        }
      });
    }
  }

  return next(request);
};

