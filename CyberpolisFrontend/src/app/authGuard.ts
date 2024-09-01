import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard  {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.isLoggedIn()) {
      return true; // Allow access to the route
    } else {
      // Redirect to the login page if not authenticated
      this.router.navigate(['auth/login'], {queryParams: {showLogInToAccessMessage: true}});
      return false;
    }
  }
}
