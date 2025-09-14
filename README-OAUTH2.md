# OAuth2 Authentication System for Cyberpolis Frontend

This document describes the OAuth2 authentication system that has been integrated with your existing JWT authentication system.

## Overview

The OAuth2 system provides:
- **Multiple OAuth2 providers**: Google, GitHub, Microsoft
- **Seamless integration** with your existing JWT system
- **Unified authentication interface** that works with both OAuth2 and JWT
- **Automatic token management** and refresh
- **Secure state parameter validation**

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   OAuth2       │    │   Spring Boot    │    │   OAuth2        │
│   Provider     │◄──►│   Backend        │◄──►│   Frontend      │
│   (Google,     │    │   (OAuth2        │    │   (Angular)     │
│   GitHub, etc.)│    │   Endpoints)     │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## Backend Requirements (Spring Boot)

Your Spring Boot backend needs to implement these OAuth2 endpoints:

### 1. OAuth2 Token Endpoint
```
POST /oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code={authorization_code}&
redirect_uri={redirect_uri}&
client_id={client_id}&
provider={provider}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token_here",
  "scope": "openid profile email",
  "id_token": "id_token_here"
}
```

### 2. OAuth2 User Info Endpoint
```
GET /oauth2/userinfo/{provider}
Authorization: Bearer {access_token}
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "displayName": "John Doe",
  "provider": "google",
  "avatar": "https://example.com/avatar.jpg"
}
```

### 3. OAuth2 Refresh Token Endpoint
```
POST /oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token={refresh_token}&
client_id={client_id}
```

## Frontend Configuration

### 1. OAuth2 Provider Configuration

Update `src/app/oauth2/oauth2.config.ts` with your actual OAuth2 client IDs:

```typescript
export const oauth2Providers = {
  google: {
    name: 'Google',
    icon: 'fab fa-google',
    color: '#4285F4',
    clientId: 'your-actual-google-client-id', // Replace this
    authorizationEndpoint: 'https://accounts.google.com/oauth/authorize',
    scope: 'openid profile email',
    responseType: 'code'
  },
  github: {
    name: 'GitHub',
    icon: 'fab fa-github',
    color: '#333',
    clientId: 'your-actual-github-client-id', // Replace this
    authorizationEndpoint: 'https://github.com/login/oauth/authorize',
    scope: 'read:user user:email',
    responseType: 'code'
  }
  // Add more providers as needed
};
```

### 2. Backend URL Configuration

Ensure your `environment.ts` has the correct backend URL:

```typescript
export const environment = {
  production: false,
  apiServerUrl: 'https://api.cyberpolisai.com', // Your Spring Boot backend URL
  // ... other config
};
```

## OAuth2 Flow

### 1. User clicks OAuth2 provider button
```typescript
// In OAuth2LoginComponent
loginWithProvider('google') {
  this.oauth2Service.initiateOAuth2Flow('google');
}
```

### 2. User is redirected to OAuth2 provider
- Frontend generates secure state parameter
- User authenticates with provider (Google, GitHub, etc.)
- Provider redirects back to `/oauth/callback` with authorization code

### 3. Frontend handles callback
```typescript
// OAuth2CallbackComponent processes the callback
this.oauth2Service.handleOAuth2Callback(code, state)
```

### 4. Token exchange
- Frontend sends authorization code to your Spring Boot backend
- Backend exchanges code for access/refresh tokens
- Backend returns tokens to frontend

### 5. User information retrieval
- Frontend uses access token to get user information
- User is authenticated and redirected to home page

## Integration with Existing JWT System

The OAuth2 system is designed to work alongside your existing JWT system:

### 1. Unified Authentication Service
```typescript
// Use UnifiedAuthService instead of AuthService for new features
constructor(private unifiedAuth: UnifiedAuthService) {}

// Check authentication status
if (this.unifiedAuth.isAuthenticated()) {
  const user = this.unifiedAuth.getCurrentUser();
  const authType = this.unifiedAuth.getAuthType(); // 'oauth2' or 'jwt'
}
```

### 2. Automatic Token Selection
The `OAuth2Interceptor` automatically selects the appropriate token:
- OAuth2 access token (if available)
- Falls back to JWT token
- Adds `X-Auth-Type` header to identify authentication method

### 3. Route Protection
```typescript
// OAuth2Guard works with both authentication methods
{ path: 'protected', component: ProtectedComponent, canActivate: [OAuth2Guard] }
```

## Security Features

### 1. State Parameter Validation
- Random state parameter generated for each OAuth2 flow
- Prevents CSRF attacks
- Stored in session storage

### 2. Token Security
- Access tokens stored in localStorage
- Refresh tokens handled securely
- Automatic token refresh before expiration

### 3. Provider Validation
- Only configured OAuth2 providers are allowed
- Client ID validation
- Secure redirect URI validation

## Usage Examples

### 1. Adding OAuth2 Login to Existing Components
```html
<!-- In your login component -->
<div class="oauth2-section">
  <app-oauth2-login></app-oauth2-login>
</div>
```

### 2. Checking Authentication Status
```typescript
// Subscribe to authentication status changes
this.unifiedAuth.authStatus$.subscribe(status => {
  if (status.isAuthenticated) {
    console.log('User authenticated via:', status.authType);
    console.log('User:', status.user);
  }
});
```

### 3. Programmatic OAuth2 Login
```typescript
// Initiate OAuth2 flow programmatically
this.unifiedAuth.initiateOAuth2Flow('google');
```

### 4. Logout
```typescript
// Logout from all authentication methods
this.unifiedAuth.logout();
```

## Testing

### 1. Local Development
```bash
# Start Angular development server
ng serve

# Test OAuth2 flow with your Spring Boot backend
# Ensure backend is running and accessible
```

### 2. OAuth2 Provider Setup
- **Google**: Create OAuth2 client in Google Cloud Console
- **GitHub**: Create OAuth App in GitHub Developer Settings
- **Microsoft**: Create app registration in Azure Portal

### 3. Backend Testing
Test your Spring Boot OAuth2 endpoints:
```bash
# Test token endpoint
curl -X POST http://localhost:8080/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&code=test_code&redirect_uri=http://localhost:4200/oauth/callback&client_id=test&provider=google"

# Test userinfo endpoint
curl -X GET http://localhost:8080/oauth2/userinfo/google \
  -H "Authorization: Bearer your_access_token"
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your Spring Boot backend allows requests from your Angular frontend
   - Configure CORS properly in Spring Security

2. **Invalid Redirect URI**
   - Check that redirect URI in OAuth2 provider matches your frontend URL
   - Ensure `/oauth/callback` route is properly configured

3. **State Parameter Mismatch**
   - Clear browser storage and try again
   - Check that session storage is working properly

4. **Token Exchange Failures**
   - Verify backend OAuth2 endpoints are working
   - Check client ID and secret configuration
   - Ensure proper grant type handling

### Debug Mode
Enable debug mode in `oauth2.config.ts`:
```typescript
export const oauth2Config: AuthConfig = {
  // ... other config
  showDebugInformation: true, // Enable debug logging
};
```

## Production Deployment

### 1. Environment Configuration
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiServerUrl: 'https://api.cyberpolisai.com',
  // Use production OAuth2 client IDs
};
```

### 2. HTTPS Requirements
- OAuth2 providers require HTTPS in production
- Ensure your domain has valid SSL certificate
- Update redirect URIs to use HTTPS

### 3. Security Headers
Add security headers to your Angular app:
```typescript
// In your server configuration
app.use(helmet()); // Add security headers
app.use(cors({
  origin: ['https://yourdomain.com'],
  credentials: true
}));
```

## Support and Maintenance

### 1. Monitoring
- Monitor OAuth2 authentication success/failure rates
- Track token refresh patterns
- Log authentication errors for debugging

### 2. Updates
- Keep OAuth2 provider libraries updated
- Monitor OAuth2 provider API changes
- Update client IDs and secrets as needed

### 3. Backup Authentication
- Maintain JWT authentication as fallback
- Ensure users can still authenticate if OAuth2 is unavailable
- Implement graceful degradation

## Conclusion

This OAuth2 system provides a robust, secure authentication solution that integrates seamlessly with your existing JWT system. Users can choose between traditional email/password login or OAuth2 providers, while maintaining a unified authentication experience throughout your application.

For additional support or customization, refer to the Angular OAuth2 OIDC library documentation and your OAuth2 provider's developer documentation.
