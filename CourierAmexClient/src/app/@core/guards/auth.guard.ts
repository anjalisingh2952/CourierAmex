import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn, CanActivateChildFn } from '@angular/router';

import { CredentialsService } from '@app/@core/services';

export const isAuthenticatedActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(CredentialsService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.navigate(['auth'], { replaceUrl: true });
};

export const isAuthenticatedActivateChild: CanActivateChildFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => isAuthenticatedActivate(route, state);
