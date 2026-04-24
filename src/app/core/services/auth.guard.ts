import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { UserRole } from '../models/user.model';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Regular users belong on the public site, not the dashboard.
  if (authService.hasRole('USER')) {
    router.navigate(['/']);
    return false;
  }

  const requiredRole = route.data['role'] as UserRole | undefined;
  const requiredRoles = route.data['roles'] as UserRole[] | undefined;

  if (requiredRoles && !authService.hasRole(...requiredRoles)) {
    router.navigate(['/app/dashboard']);
    return false;
  }

  if (requiredRole && !authService.hasRole(requiredRole)) {
    router.navigate(['/app/dashboard']);
    return false;
  }

  return true;
};
