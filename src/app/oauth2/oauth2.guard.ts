import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { OAuth2Service } from './oauth2.service';

@Injectable({
  providedIn: 'root'
})
export class OAuth2Guard implements CanActivate {
  constructor(
    private oauth2Service: OAuth2Service,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    // Check if user is authenticated via OAuth2
    if (this.oauth2Service.isAuthenticated()) {
      return true;
    }

    // Check if user is authenticated via JWT (existing system)
    const jwtToken = localStorage.getItem('jwt_token');
    if (jwtToken) {
      return true;
    }

    // User is not authenticated, redirect to login
    this.router.navigate(['/auth/login']);
    return false;
  }
}
