import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable, map, catchError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  responseType: 'text' as 'json' 
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isBrowser: boolean;

  constructor(private http: HttpClient, @Inject(PLATFORM_ID) private platformId: object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }
    
  public login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiServerUrl}/auth/login`, {"email":email, "password": password}, httpOptions)
      .pipe(
        map((response: any) => {
          if(response){
            localStorage.setItem('jwt_token', response);
          }
          return response;
        }),
        
      );
  }

  public signup(email: string, displayName: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiServerUrl}/auth/signup`, {displayName, email, password}, httpOptions).pipe(
      map((response: any) => {
          if(response){
            localStorage.setItem('jwt_token', response);
          }
          return response;
      })
    )
  }

  public guestUser(): Observable<any> {
    return this.http.post(`${environment.apiServerUrl}/auth/guest`, {}, httpOptions).pipe(
      map((response: any) => {
          if(response){
            localStorage.setItem('jwt_token', response);
          }
          return response;
      })
    )
  }

  public logout(): void{
    localStorage.removeItem('jwt_token');
  }

  public getJwtToken(): string | null {
    return localStorage.getItem('jwt_token');
  }

  public isLoggedIn(): boolean{
    if(this.isBrowser){
      return !!localStorage.getItem('jwt_token');
    }
    return false
  }

  public getUserInfo():Observable<any> {
    return this.http.get(`${environment.apiServerUrl}/auth/getInfo`);
  }

}
  