import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateFn, CanActivateChildFn } from '@angular/router';

import { CredentialsService } from '@app/@core/services';

export const hasViewPermissionActivate: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const router = inject(Router);
  const authService = inject(CredentialsService);

  const credentials = authService.credentials;
  const permissions = credentials?.user?.permissions;
  if (!!permissions && permissions?.length > 0) {
    const isValid = permissions.find(p => p.id === route.data['Permission'] && !!p.view);
    if (isValid) {
      return true;
    }
  }

  return router.navigate(['error', 'unauthorized'], { replaceUrl: true });
};

export const hasViewPermissionActivateChild: CanActivateChildFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => hasViewPermissionActivate(route, state);
