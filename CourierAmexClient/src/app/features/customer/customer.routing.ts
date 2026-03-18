import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { hasViewPermissionActivateChild, isAuthenticatedActivateChild } from '@app/@core';
import { EmptyComponent } from '@app/@shared';
import { PermissionsEnum } from '@app/models';
import * as containers from './containers';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
    data: { breadcrumb: 'Sidebar.Customer', Permission: PermissionsEnum.Customers },
    component: EmptyComponent,
    children: [
      {
        path: 'list',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Customers', Permission: PermissionsEnum.Customers },
        component: containers.CustomerListContainer
      },
      {
        path: 'details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.CustomerDetails', Permission: PermissionsEnum.Customers },
        component: containers.CustomerDetailsContainer
      },{
        path: 'customer-service',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.CustomerService', Permission: PermissionsEnum.Customers },
        component: containers.CustomerServiceComponent
      },{
        path: 'enabled-credit',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.EnabledCredit', Permission: PermissionsEnum.Customers },
        component: containers.EnabledCreditComponent
      },
      {
        path: '', pathMatch: 'full', redirectTo: '/customer/list',
      }
    ]
  },
  {
    path: '', pathMatch: 'full', redirectTo: '/customer/list',
  }
];

@NgModule({
  imports: [RouterModule.forChild(CUSTOMER_ROUTES)],
  exports: [RouterModule],
})
export class CustomerRoutingModule { }
