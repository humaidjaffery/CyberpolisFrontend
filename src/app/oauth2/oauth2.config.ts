import { AuthConfig } from 'angular-oauth2-oidc';

export const oauth2Config: AuthConfig = {
  // OAuth2 Configuration
  issuer: 'https://api.cyberpolisai.com',
  redirectUri: window.location.origin + '/oauth/callback',
  clientId: 'cyberpolis-frontend',
  responseType: 'code',
  scope: 'openid profile email',
  showDebugInformation: true,
  requireHttps: true,
  
  // Custom endpoints for your Spring Boot backend
  // Custom endpoints for your Spring Boot backend
  tokenEndpoint: 'https://api.cyberpolisai.com/oauth2/token',
  userinfoEndpoint: 'https://api.cyberpolisai.com/oauth2/userinfo',
  
  // JWT integration
  useSilentRefresh: true,
  silentRefreshTimeout: 5000,
  
  // Custom parameters for your backend
  customQueryParams: {
    // Add any custom parameters your Spring Boot backend expects
  }
};

// OAuth2 Provider configurations
export const oauth2Providers = {
  google: {
    name: 'Google',
    icon: 'fab fa-google',
    color: '#4285F4',
    clientId: 'your-google-client-id', // Replace with your Google OAuth2 client ID
    authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
    scope: 'openid profile email',
    responseType: 'code'
  },
  github: {
    name: 'GitHub',
    icon: 'fab fa-github',
    color: '#333',
    clientId: 'your-github-client-id', // Replace with your GitHub OAuth2 client ID
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    scope: 'read:user user:email',
    responseType: 'code'
  },
  microsoft: {
    name: 'Microsoft',
    icon: 'fab fa-microsoft',
    color: '#00A1F1',
    clientId: 'your-microsoft-client-id', // Replace with your Microsoft OAuth2 client ID
    authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    scope: 'openid profile email',
    responseType: 'code'
  }
};

