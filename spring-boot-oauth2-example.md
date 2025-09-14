# Spring Boot OAuth2 Backend Implementation

This document provides a sample implementation of the OAuth2 endpoints that your Spring Boot backend needs to implement to work with the Angular OAuth2 frontend.

## Required Dependencies

Add these dependencies to your `pom.xml`:

```xml
<dependencies>
    <!-- Spring Boot Starter Web -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter OAuth2 Client -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-client</artifactId>
    </dependency>
    
    <!-- Spring Boot Starter Data JPA (for user management) -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    
    <!-- JWT Support -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.11.5</version>
        <scope>runtime</scope>
    </dependency>
</dependencies>
```

## Application Properties

Configure your OAuth2 providers in `application.yml`:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID}
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope:
              - openid
              - profile
              - email
          github:
            client-id: ${GITHUB_CLIENT_ID}
            client-secret: ${GITHUB_CLIENT_SECRET}
            scope:
              - read:user
              - user:email
          microsoft:
            client-id: ${MICROSOFT_CLIENT_ID}
            client-secret: ${MICROSOFT_CLIENT_SECRET}
            scope:
              - openid
              - profile
              - email

# JWT Configuration
jwt:
  secret: ${JWT_SECRET:your-jwt-secret-key-here}
  expiration: 86400000 # 24 hours

# CORS Configuration
cors:
  allowed-origins: 
    - http://localhost:4200
    - https://yourdomain.com
```

## OAuth2 Controller

Create `OAuth2Controller.java`:

```java
package com.cyberpolis.oauth2.controller;

import com.cyberpolis.oauth2.dto.OAuth2TokenRequest;
import com.cyberpolis.oauth2.dto.OAuth2TokenResponse;
import com.cyberpolis.oauth2.dto.OAuth2UserInfo;
import com.cyberpolis.oauth2.service.OAuth2Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/oauth2")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class OAuth2Controller {

    @Autowired
    private OAuth2Service oauth2Service;

    /**
     * Exchange authorization code for tokens
     */
    @PostMapping("/token")
    public ResponseEntity<OAuth2TokenResponse> exchangeCodeForTokens(
            @Valid @RequestBody OAuth2TokenRequest request) {
        
        try {
            OAuth2TokenResponse response = oauth2Service.exchangeCodeForTokens(
                request.getCode(),
                request.getRedirectUri(),
                request.getClientId(),
                request.getProvider()
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get user information from OAuth2 provider
     */
    @GetMapping("/userinfo/{provider}")
    public ResponseEntity<OAuth2UserInfo> getUserInfo(
            @PathVariable String provider,
            @RequestHeader("Authorization") String authorization) {
        
        try {
            String token = authorization.replace("Bearer ", "");
            OAuth2UserInfo userInfo = oauth2Service.getUserInfo(provider, token);
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Refresh OAuth2 tokens
     */
    @PostMapping("/refresh")
    public ResponseEntity<OAuth2TokenResponse> refreshTokens(
            @RequestParam String refreshToken,
            @RequestParam String clientId) {
        
        try {
            OAuth2TokenResponse response = oauth2Service.refreshTokens(refreshToken, clientId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
```

## DTOs (Data Transfer Objects)

Create `OAuth2TokenRequest.java`:

```java
package com.cyberpolis.oauth2.dto;

import javax.validation.constraints.NotBlank;

public class OAuth2TokenRequest {
    
    @NotBlank(message = "Authorization code is required")
    private String code;
    
    @NotBlank(message = "Redirect URI is required")
    private String redirectUri;
    
    @NotBlank(message = "Client ID is required")
    private String clientId;
    
    @NotBlank(message = "Provider is required")
    private String provider;
    
    // Getters and setters
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    
    public String getRedirectUri() { return redirectUri; }
    public void setRedirectUri(String redirectUri) { this.redirectUri = redirectUri; }
    
    public String getClientId() { return clientId; }
    public void setClientId(String clientId) { this.clientId = clientId; }
    
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
}
```

Create `OAuth2TokenResponse.java`:

```java
package com.cyberpolis.oauth2.dto;

public class OAuth2TokenResponse {
    
    private String accessToken;
    private String tokenType;
    private long expiresIn;
    private String refreshToken;
    private String scope;
    private String idToken;
    
    // Constructor
    public OAuth2TokenResponse(String accessToken, String tokenType, long expiresIn, 
                             String refreshToken, String scope, String idToken) {
        this.accessToken = accessToken;
        this.tokenType = tokenType;
        this.expiresIn = expiresIn;
        this.refreshToken = refreshToken;
        this.scope = scope;
        this.idToken = idToken;
    }
    
    // Getters and setters
    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }
    
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    
    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }
    
    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
    
    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }
    
    public String getIdToken() { return idToken; }
    public void setIdToken(String idToken) { this.idToken = idToken; }
}
```

Create `OAuth2UserInfo.java`:

```java
package com.cyberpolis.oauth2.dto;

public class OAuth2UserInfo {
    
    private String id;
    private String email;
    private String displayName;
    private String provider;
    private String avatar;
    
    // Constructor
    public OAuth2UserInfo(String id, String email, String displayName, String provider, String avatar) {
        this.id = id;
        this.email = email;
        this.displayName = displayName;
        this.provider = provider;
        this.avatar = avatar;
    }
    
    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    
    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }
}
```

## OAuth2 Service

Create `OAuth2Service.java`:

```java
package com.cyberpolis.oauth2.service;

import com.cyberpolis.oauth2.dto.OAuth2TokenResponse;
import com.cyberpolis.oauth2.dto.OAuth2UserInfo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.Map;

@Service
public class OAuth2Service {

    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;
    
    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;
    
    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String githubClientId;
    
    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String githubClientSecret;

    /**
     * Exchange authorization code for tokens
     */
    public OAuth2TokenResponse exchangeCodeForTokens(String code, String redirectUri, 
                                                   String clientId, String provider) {
        
        // Validate client ID
        if (!isValidClientId(clientId, provider)) {
            throw new IllegalArgumentException("Invalid client ID for provider: " + provider);
        }
        
        // Exchange code for tokens based on provider
        switch (provider.toLowerCase()) {
            case "google":
                return exchangeGoogleCode(code, redirectUri);
            case "github":
                return exchangeGithubCode(code, redirectUri);
            case "microsoft":
                return exchangeMicrosoftCode(code, redirectUri);
            default:
                throw new IllegalArgumentException("Unsupported provider: " + provider);
        }
    }

    /**
     * Get user information from OAuth2 provider
     */
    public OAuth2UserInfo getUserInfo(String provider, String accessToken) {
        
        switch (provider.toLowerCase()) {
            case "google":
                return getGoogleUserInfo(accessToken);
            case "github":
                return getGithubUserInfo(accessToken);
            case "microsoft":
                return getMicrosoftUserInfo(accessToken);
            default:
                throw new IllegalArgumentException("Unsupported provider: " + provider);
        }
    }

    /**
     * Refresh OAuth2 tokens
     */
    public OAuth2TokenResponse refreshTokens(String refreshToken, String clientId) {
        // Implement token refresh logic
        // This would typically involve calling the OAuth2 provider's token endpoint
        throw new UnsupportedOperationException("Token refresh not implemented yet");
    }

    // Private helper methods

    private boolean isValidClientId(String clientId, String provider) {
        switch (provider.toLowerCase()) {
            case "google":
                return googleClientId.equals(clientId);
            case "github":
                return githubClientId.equals(clientId);
            default:
                return false;
        }
    }

    private OAuth2TokenResponse exchangeGoogleCode(String code, String redirectUri) {
        String tokenUrl = "https://oauth2.googleapis.com/token";
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", redirectUri);
        body.add("client_id", googleClientId);
        body.add("client_secret", googleClientSecret);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
        Map<String, Object> responseBody = response.getBody();
        
        return new OAuth2TokenResponse(
            (String) responseBody.get("access_token"),
            (String) responseBody.get("token_type"),
            ((Number) responseBody.get("expires_in")).longValue(),
            (String) responseBody.get("refresh_token"),
            (String) responseBody.get("scope"),
            (String) responseBody.get("id_token")
        );
    }

    private OAuth2TokenResponse exchangeGithubCode(String code, String redirectUri) {
        String tokenUrl = "https://github.com/login/oauth/access_token";
        
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", redirectUri);
        body.add("client_id", githubClientId);
        body.add("client_secret", githubClientSecret);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        
        ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
        Map<String, Object> responseBody = response.getBody();
        
        return new OAuth2TokenResponse(
            (String) responseBody.get("access_token"),
            "Bearer",
            0, // GitHub doesn't provide expires_in
            null, // GitHub doesn't provide refresh_token
            null, // GitHub doesn't provide scope in token response
            null  // GitHub doesn't provide id_token
        );
    }

    private OAuth2TokenResponse exchangeMicrosoftCode(String code, String redirectUri) {
        // Implement Microsoft OAuth2 token exchange
        // Similar to Google implementation
        throw new UnsupportedOperationException("Microsoft OAuth2 not implemented yet");
    }

    private OAuth2UserInfo getGoogleUserInfo(String accessToken) {
        String userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            userInfoUrl, HttpMethod.GET, request, Map.class);
        Map<String, Object> userInfo = response.getBody();
        
        return new OAuth2UserInfo(
            (String) userInfo.get("id"),
            (String) userInfo.get("email"),
            (String) userInfo.get("name"),
            "google",
            (String) userInfo.get("picture")
        );
    }

    private OAuth2UserInfo getGithubUserInfo(String accessToken) {
        String userInfoUrl = "https://api.github.com/user";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.set("Accept", "application/vnd.github.v3+json");
        
        HttpEntity<String> request = new HttpEntity<>(headers);
        
        ResponseEntity<Map> response = restTemplate.exchange(
            userInfoUrl, HttpMethod.GET, request, Map.class);
        Map<String, Object> userInfo = response.getBody();
        
        return new OAuth2UserInfo(
            userInfo.get("id").toString(),
            (String) userInfo.get("email"),
            (String) userInfo.get("name"),
            "github",
            (String) userInfo.get("avatar_url")
        );
    }

    private OAuth2UserInfo getMicrosoftUserInfo(String accessToken) {
        // Implement Microsoft user info retrieval
        throw new UnsupportedOperationException("Microsoft user info not implemented yet");
    }
}
```

## Security Configuration

Create `SecurityConfig.java`:

```java
package com.cyberpolis.oauth2.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/oauth2/**").permitAll()
                .requestMatchers("/auth/**").permitAll()
                .anyRequest().authenticated()
            );
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:4200", "https://yourdomain.com"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

## RestTemplate Configuration

Create `RestTemplateConfig.java`:

```java
package com.cyberpolis.oauth2.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
```

## Environment Variables

Set these environment variables in your production environment:

```bash
# Google OAuth2
export GOOGLE_CLIENT_ID="your-google-client-id"
export GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth2
export GITHUB_CLIENT_ID="your-github-client-id"
export GITHUB_CLIENT_SECRET="your-github-client-secret"

# Microsoft OAuth2
export MICROSOFT_CLIENT_ID="your-microsoft-client-id"
export MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"

# JWT Secret
export JWT_SECRET="your-super-secure-jwt-secret-key"
```

## Testing the Endpoints

### 1. Test Token Exchange
```bash
curl -X POST http://localhost:8080/oauth2/token \
  -H "Content-Type: application/json" \
  -d '{
    "code": "test_authorization_code",
    "redirectUri": "http://localhost:4200/oauth/callback",
    "clientId": "your-google-client-id",
    "provider": "google"
  }'
```

### 2. Test User Info
```bash
curl -X GET http://localhost:8080/oauth2/userinfo/google \
  -H "Authorization: Bearer your_access_token"
```

## Integration with Existing JWT System

To integrate with your existing JWT system:

1. **User Management**: Store OAuth2 users in your existing user table
2. **Token Generation**: Generate JWT tokens after successful OAuth2 authentication
3. **Session Management**: Use the same session management for both authentication methods
4. **Authorization**: Apply the same authorization rules regardless of authentication method

## Next Steps

1. **Implement User Storage**: Store OAuth2 users in your database
2. **Add JWT Integration**: Generate JWT tokens after OAuth2 authentication
3. **Implement Token Refresh**: Add proper token refresh logic
4. **Add More Providers**: Implement additional OAuth2 providers as needed
5. **Error Handling**: Add comprehensive error handling and logging
6. **Rate Limiting**: Implement rate limiting for OAuth2 endpoints
7. **Monitoring**: Add metrics and monitoring for OAuth2 flows

This implementation provides a solid foundation for OAuth2 authentication that integrates seamlessly with your existing JWT system.
