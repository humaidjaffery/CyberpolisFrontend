import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from 'src/environments/environment';
import { oauth2Providers } from './oauth2.config';

export interface OAuth2User {
  id: string;
  email: string;
  displayName: string;
  provider: string;
  avatar?: string;
}

export interface OAuth2TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OAuth2Service {
  private isBrowser: boolean;
  private currentUserSubject = new BehaviorSubject<OAuth2User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.loadStoredUser();
  }

  /**
   * Initiate OAuth2 flow for a specific provider
   */
  public initiateOAuth2Flow(provider: string): void {
    if (!this.isBrowser) return;

    const providerConfig = oauth2Providers[provider as keyof typeof oauth2Providers];
    if (!providerConfig) {
      throw new Error(`Unsupported OAuth2 provider: ${provider}`);
    }

    // Store the provider for callback handling
    sessionStorage.setItem('oauth2_provider', provider);
    
    // Generate state parameter for security
    const state = this.generateRandomState();
    sessionStorage.setItem('oauth2_state', state);

    // Build authorization URL
    const authUrl = this.buildAuthorizationUrl(providerConfig, state);
    
    // Redirect to OAuth2 provider
    window.location.href = authUrl;
  }

  /**
   * Handle OAuth2 callback from provider
   */
  public handleOAuth2Callback(code: string, state: string): Observable<OAuth2TokenResponse> {
    if (!this.isBrowser) return throwError(() => new Error('Not in browser environment'));

    // Verify state parameter
    const storedState = sessionStorage.getItem('oauth2_state');
    if (state !== storedState) {
      return throwError(() => new Error('Invalid state parameter'));
    }

    const provider = sessionStorage.getItem('oauth2_provider');
    if (!provider) {
      return throwError(() => new Error('No OAuth2 provider found'));
    }

    // Exchange authorization code for tokens
    return this.exchangeCodeForTokens(code, provider).pipe(
      tap(response => {
        // Store tokens
        this.storeTokens(response);
        // Clear session storage
        sessionStorage.removeItem('oauth2_provider');
        sessionStorage.removeItem('oauth2_state');
      })
    );
  }

  /**
   * Exchange authorization code for tokens
   */
  private exchangeCodeForTokens(code: string, provider: string): Observable<OAuth2TokenResponse> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: `${window.location.origin}/oauth/callback`,
      client_id: oauth2Providers[provider as keyof typeof oauth2Providers]?.clientId || '',
      client_secret: '', // Your client secret should be handled server-side
      provider: provider
    });

    return this.http.post<OAuth2TokenResponse>(
      `${environment.apiServerUrl}/oauth2/token`,
      body.toString(),
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Error exchanging code for tokens:', error);
        return throwError(() => new Error('Failed to exchange authorization code for tokens'));
      })
    );
  }

  /**
   * Get user information from OAuth2 provider
   */
  public getUserInfo(provider: string): Observable<OAuth2User> {
    return this.http.get<OAuth2User>(`${environment.apiServerUrl}/oauth2/userinfo/${provider}`).pipe(
      tap(user => {
        this.currentUserSubject.next(user);
        this.storeUser(user);
      }),
      catchError(error => {
        console.error('Error getting user info:', error);
        return throwError(() => new Error('Failed to get user information'));
      })
    );
  }

  /**
   * Refresh OAuth2 tokens
   */
  public refreshTokens(): Observable<OAuth2TokenResponse> {
    const refreshToken = localStorage.getItem('oauth2_refresh_token');
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: 'cyberpolis-frontend'
    });

    return this.http.post<OAuth2TokenResponse>(
      `${environment.apiServerUrl}/oauth2/token`,
      body.toString(),
      { headers }
    ).pipe(
      tap(response => this.storeTokens(response)),
      catchError(error => {
        console.error('Error refreshing tokens:', error);
        this.logout();
        return throwError(() => new Error('Failed to refresh tokens'));
      })
    );
  }

  /**
   * Logout and clear all OAuth2 data
   */
  public logout(): void {
    if (!this.isBrowser) return;

    // Clear OAuth2 tokens
    localStorage.removeItem('oauth2_access_token');
    localStorage.removeItem('oauth2_refresh_token');
    localStorage.removeItem('oauth2_id_token');
    
    // Clear user data
    localStorage.removeItem('oauth2_user');
    this.currentUserSubject.next(null);
    
    // Clear session storage
    sessionStorage.removeItem('oauth2_provider');
    sessionStorage.removeItem('oauth2_state');
    
    // Also clear JWT token if it exists
    localStorage.removeItem('jwt_token');
  }

  /**
   * Check if user is authenticated via OAuth2
   */
  public isAuthenticated(): boolean {
    if (!this.isBrowser) return false;
    
    const accessToken = localStorage.getItem('oauth2_access_token');
    const user = localStorage.getItem('oauth2_user');
    
    return !!(accessToken && user);
  }

  /**
   * Get current OAuth2 user
   */
  public getCurrentUser(): OAuth2User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Get OAuth2 access token
   */
  public getAccessToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem('oauth2_access_token');
  }

  // Private helper methods

  private buildAuthorizationUrl(providerConfig: any, state: string): string {
    const params = new URLSearchParams({
      response_type: providerConfig.responseType,
      client_id: providerConfig.clientId,
      redirect_uri: `${window.location.origin}/oauth/callback`,
      scope: providerConfig.scope,
      state: state
    });

    return `${providerConfig.authorizationEndpoint}?${params.toString()}`;
  }

  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  private storeTokens(response: OAuth2TokenResponse): void {
    if (!this.isBrowser) return;

    localStorage.setItem('oauth2_access_token', response.access_token);
    if (response.refresh_token) {
      localStorage.setItem('oauth2_refresh_token', response.refresh_token);
    }
    if (response.id_token) {
      localStorage.setItem('oauth2_id_token', response.id_token);
    }
  }

  private storeUser(user: OAuth2User): void {
    if (!this.isBrowser) return;
    localStorage.setItem('oauth2_user', JSON.stringify(user));
  }

  private loadStoredUser(): void {
    if (!this.isBrowser) return;

    const storedUser = localStorage.getItem('oauth2_user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('oauth2_user');
      }
    }
  }
}

