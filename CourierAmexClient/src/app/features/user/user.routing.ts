import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { hasViewPermissionActivateChild, isAuthenticatedActivateChild } from '@app/@core';
import { EmptyComponent } from '@app/@shared';
import { PermissionsEnum } from '@app/models';
import * as containers from './containers';

export const USER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [isAuthenticatedActivateChild],
    data: { breadcrumb: 'Sidebar.User' },
    component: EmptyComponent,
    children: [
      {
        path: 'list',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Users', Permission: PermissionsEnum.Users },
        component: containers.UserListContainer
      },
      {
        path: 'details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.UserDetails', Permission: PermissionsEnum.Users },
        component: containers.UserDetailsContainer
      },
      {
        path: 'roles',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Roles', Permission: PermissionsEnum.Roles },
        component: containers.RoleListContainer
      },
      {
        path: 'role-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.RoleDetails', Permission: PermissionsEnum.Roles },
        component: containers.RoleDetailsContainer
      },
      {
        path: 'profile',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.UserProfile' },
        component: containers.UserProfileContainer
      },
      {
        path: '', pathMatch: 'full', redirectTo: '/user/list',
      }
    ]
  },
  {
    path: '', pathMatch: 'full', redirectTo: '/user/list',
  }
];

@NgModule({
  imports: [RouterModule.forChild(USER_ROUTES)],
  exports: [RouterModule],
})
export class UserRoutingModule { }
