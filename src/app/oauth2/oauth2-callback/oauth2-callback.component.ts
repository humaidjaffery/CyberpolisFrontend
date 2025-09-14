import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { OAuth2Service } from '../oauth2.service';

@Component({
  selector: 'app-oauth2-callback',
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-50">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
            Processing OAuth2 Login...
          </h2>
          <p class="mt-2 text-sm text-gray-600">
            Please wait while we complete your authentication.
          </p>
        </div>
        
        <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-md p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">
                Authentication Error
              </h3>
              <div class="mt-2 text-sm text-red-700">
                {{ error }}
              </div>
              <div class="mt-4">
                <button
                  (click)="goToLogin()"
                  class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Return to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class OAuth2CallbackComponent implements OnInit {
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private oauth2Service: OAuth2Service,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Get query parameters from the OAuth2 callback
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const state = params['state'];
      const error = params['error'];

      if (error) {
        this.handleError(error);
        return;
      }

      if (!code || !state) {
        this.handleError('Missing authorization code or state parameter');
        return;
      }

      // Process the OAuth2 callback
      this.processOAuth2Callback(code, state);
    });
  }

  private processOAuth2Callback(code: string, state: string): void {
    this.oauth2Service.handleOAuth2Callback(code, state).subscribe({
      next: (response) => {
        console.log('OAuth2 authentication successful:', response);
        
        // Get user information
        const provider = sessionStorage.getItem('oauth2_provider') || 'unknown';
        this.oauth2Service.getUserInfo(provider).subscribe({
          next: (user) => {
            console.log('User info retrieved:', user);
            // Redirect to home page or dashboard
            this.router.navigate(['/home']);
          },
          error: (error) => {
            console.error('Error getting user info:', error);
            // Still redirect to home, user info can be fetched later
            this.router.navigate(['/home']);
          }
        });
      },
      error: (error) => {
        console.error('OAuth2 callback error:', error);
        this.handleError(error.message || 'Failed to complete OAuth2 authentication');
      }
    });
  }

  private handleError(errorMessage: string): void {
    this.error = errorMessage;
    console.error('OAuth2 authentication error:', errorMessage);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}

