import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { OAuth2Service } from '../oauth2.service';
import { oauth2Providers } from '../oauth2.config';

@Component({
  selector: 'app-oauth2-login',
  template: `
    <div class="space-y-4">
      <!-- OAuth2 Provider Buttons -->
      <div class="space-y-3">
        <div 
          *ngFor="let provider of availableProviders" 
          class="oauth2-provider-button"
          [style.background-color]="provider.color"
          (click)="loginWithProvider(provider.key)"
        >
          <div class="flex items-center justify-center space-x-3">
            <i [class]="provider.icon" class="text-white text-lg"></i>
            <span class="text-white font-medium">
              Continue with {{ provider.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Divider -->
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <!-- Error Message -->
      <div *ngIf="error" class="bg-red-50 border border-red-200 rounded-md p-3">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="flex items-center justify-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span class="ml-2 text-sm text-gray-600">Redirecting to {{ currentProvider }}...</span>
      </div>
    </div>
  `,
  styles: [`
    .oauth2-provider-button {
      @apply w-full py-3 px-4 rounded-lg cursor-pointer transition-all duration-200 hover:opacity-90 active:scale-95;
    }
  `]
})
export class OAuth2LoginComponent {
  availableProviders: Array<{key: string, name: string, icon: string, color: string}> = [];
  isLoading = false;
  currentProvider = '';
  error: string | null = null;

  constructor(
    private oauth2Service: OAuth2Service,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Convert oauth2Providers object to array for easier iteration
    this.availableProviders = Object.entries(oauth2Providers).map(([key, provider]) => ({
      key,
      name: provider.name,
      icon: provider.icon,
      color: provider.color
    }));
  }

  loginWithProvider(provider: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      this.isLoading = true;
      this.currentProvider = oauth2Providers[provider as keyof typeof oauth2Providers]?.name || provider;
      this.error = null;

      // Initiate OAuth2 flow
      this.oauth2Service.initiateOAuth2Flow(provider);
    } catch (error) {
      this.isLoading = false;
      this.error = error instanceof Error ? error.message : 'Failed to initiate OAuth2 login';
      console.error('OAuth2 login error:', error);
    }
  }
}

