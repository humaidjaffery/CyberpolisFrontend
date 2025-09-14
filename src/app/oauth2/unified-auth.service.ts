import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from 'src/environments/environment';
import { OAuth2Service, OAuth2User } from './oauth2.service';

export interface UnifiedUser {
  id: string;
  email: string;
  displayName: string;
  authType: 'oauth2' | 'jwt';
  provider?: string;
  avatar?: string;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  authType: 'oauth2' | 'jwt' | null;
  user: UnifiedUser | null;
}

@Injectable({
  providedIn: 'root'
})
export class UnifiedAuthService {
  private isBrowser: boolean;
  private authStatusSubject = new BehaviorSubject<AuthStatus>({
    isAuthenticated: false,
    authType: null,
    user: null
  });
  public authStatus$ = this.authStatusSubject.asObservable();

  constructor(
    private http: HttpClient,
    private oauth2Service: OAuth2Service,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.initializeAuthStatus();
  }

  /**
   * Initialize authentication status on service creation
   */
  private initializeAuthStatus(): void {
    if (!this.isBrowser) return;

    // Check OAuth2 authentication first
    if (this.oauth2Service.isAuthenticated()) {
      const oauth2User = this.oauth2Service.getCurrentUser();
      if (oauth2User) {
        this.updateAuthStatus({
          isAuthenticated: true,
          authType: 'oauth2',
          user: this.convertOAuth2UserToUnified(oauth2User)
        });
        return;
      }
    }

    // Check JWT authentication
    const jwtToken = localStorage.getItem('jwt_token');
    if (jwtToken) {
      this.updateAuthStatus({
        isAuthenticated: true,
        authType: 'jwt',
        user: null // User info will be fetched when needed
      });
      this.fetchJWTUserInfo();
    }
  }

  /**
   * Get current authentication status
   */
  public getAuthStatus(): AuthStatus {
    return this.authStatusSubject.value;
  }

  /**
   * Check if user is authenticated (either OAuth2 or JWT)
   */
  public isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    return this.authStatusSubject.value.isAuthenticated;
  }

  /**
   * Get current user information
   */
  public getCurrentUser(): UnifiedUser | null {
    return this.authStatusSubject.value.user;
  }

  /**
   * Get authentication type
   */
  public getAuthType(): 'oauth2' | 'jwt' | null {
    return this.authStatusSubject.value.authType;
  }

  /**
   * Get access token (OAuth2 or JWT)
   */
  public getAccessToken(): string | null {
    if (!this.isBrowser) return null;

    // Try OAuth2 token first
    const oauth2Token = this.oauth2Service.getAccessToken();
    if (oauth2Token) {
      return oauth2Token;
    }

    // Fall back to JWT token
    return localStorage.getItem('jwt_token');
  }

  /**
   * Login with email and password (JWT)
   */
  public login(email: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiServerUrl}/auth/login`, 
      { email, password }, 
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap((response: any) => {
        if (response && typeof response.token === 'string') {
          localStorage.setItem('jwt_token', response.token);
          this.updateAuthStatus({
            isAuthenticated: true,
            authType: 'jwt',
            user: null
          });
          this.fetchJWTUserInfo();
        }
      }),
      catchError(error => {
        console.error('JWT login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Signup with email, display name, and password (JWT)
   */
  public signup(email: string, displayName: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiServerUrl}/auth/signup`, 
      { displayName, email, password },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap((response: any) => {
        if (response && typeof response.token === 'string') {
          localStorage.setItem('jwt_token', response.token);
          this.updateAuthStatus({
            isAuthenticated: true,
            authType: 'jwt',
            user: null
          });
          this.fetchJWTUserInfo();
        }
      }),
      catchError(error => {
        console.error('JWT signup error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Guest user login (JWT)
   */
  public guestUser(): Observable<any> {
    return this.http.post(`${environment.apiServerUrl}/auth/guest`, {}).pipe(
      tap((response: any) => {
        if (response && typeof response.token === 'string') {
          localStorage.setItem('jwt_token', response.token);
          this.updateAuthStatus({
            isAuthenticated: true,
            authType: 'jwt',
            user: null
          });
          this.fetchJWTUserInfo();
        }
      }),
      catchError(error => {
        console.error('Guest login error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Initiate OAuth2 flow
   */
  public initiateOAuth2Flow(provider: string): void {
    this.oauth2Service.initiateOAuth2Flow(provider);
  }

  /**
   * Handle OAuth2 callback
   */
  public handleOAuth2Callback(code: string, state: string): Observable<any> {
    return this.oauth2Service.handleOAuth2Callback(code, state).pipe(
      tap(response => {
        // Get user information after successful token exchange
        const provider = sessionStorage.getItem('oauth2_provider') || 'unknown';
        this.oauth2Service.getUserInfo(provider).subscribe({
          next: (user) => {
            this.updateAuthStatus({
              isAuthenticated: true,
              authType: 'oauth2',
              user: this.convertOAuth2UserToUnified(user)
            });
          },
          error: (error) => {
            console.error('Error getting OAuth2 user info:', error);
          }
        });
      })
    );
  }

  /**
   * Logout from all authentication methods
   */
  public logout(): void {
    if (!this.isBrowser) return;

    // Clear OAuth2 data
    this.oauth2Service.logout();

    // Clear JWT data
    localStorage.removeItem('jwt_token');

    // Update auth status
    this.updateAuthStatus({
      isAuthenticated: false,
      authType: null,
      user: null
    });
  }

  /**
   * Refresh authentication tokens
   */
  public refreshTokens(): Observable<any> {
    const authType = this.getAuthType();
    
    if (authType === 'oauth2') {
      return this.oauth2Service.refreshTokens();
    } else if (authType === 'jwt') {
      // Implement JWT refresh logic if needed
      return of(null);
    }
    
    return throwError(() => new Error('No authentication type found'));
  }

  /**
   * Fetch JWT user information
   */
  private fetchJWTUserInfo(): void {
    this.http.get(`${environment.apiServerUrl}/auth/getInfo`).subscribe({
      next: (userInfo: any) => {
        const unifiedUser: UnifiedUser = {
          id: userInfo.id || userInfo.email,
          email: userInfo.email,
          displayName: userInfo.displayName || userInfo.name || 'User',
          authType: 'jwt'
        };
        
        this.updateAuthStatus({
          isAuthenticated: true,
          authType: 'jwt',
          user: unifiedUser
        });
      },
      error: (error) => {
        console.error('Error fetching JWT user info:', error);
      }
    });
  }

  /**
   * Convert OAuth2 user to unified user format
   */
  private convertOAuth2UserToUnified(oauth2User: OAuth2User): UnifiedUser {
    return {
      id: oauth2User.id,
      email: oauth2User.email,
      displayName: oauth2User.displayName,
      authType: 'oauth2',
      provider: oauth2User.provider,
      avatar: oauth2User.avatar
    };
  }

  /**
   * Update authentication status
   */
  private updateAuthStatus(status: AuthStatus): void {
    this.authStatusSubject.next(status);
  }
}
