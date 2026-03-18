import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { hasViewPermissionActivateChild, isAuthenticatedActivateChild } from '@app/@core';
import { EmptyComponent } from '@app/@shared';
import { PermissionsEnum } from '@app/models';
import * as containers from './containers';

export const GENERAL_ROUTES: Routes = [
  {
    path: '',
    canActivate: [isAuthenticatedActivateChild],
    data: { breadcrumb: 'Sidebar.Settings' },
    component: EmptyComponent,
    children: [
      {
        path: 'areas',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Areas', Permission: PermissionsEnum.Areas },
        component: containers.AreaListContainer
      },
      {
        path: 'area-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.AreaDetails', Permission: PermissionsEnum.Areas },
        component: containers.AreaDetailsContainer
      },
      {
        path: 'control-codes',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ControlCodes', Permission: PermissionsEnum.ControlCodes },
        component: containers.ControlCodeDetailsContainer
      },
      {
        path: 'countries',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Countries', Permission: PermissionsEnum.Countries },
        component: containers.CountryListContainer
      },
      {
        path: 'country-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.CountryDetails', Permission: PermissionsEnum.Countries },
        component: containers.CountryDetailsContainer
      },
      {
        path: 'package-status',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackageStatus', Permission: PermissionsEnum.PackageStatus },
        component: containers.PackageStatusListContainer
      },
      {
        path: 'package-status-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackageStatusDetails', Permission: PermissionsEnum.PackageStatus },
        component: containers.PackageStatusDetailsContainer
      },
      {
        path: 'shipping-way-types',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ShippingWayTypes', Permission: PermissionsEnum.ShippingWayTypes },
        component: containers.ShippingWayTypeListContainer
      },
      {
        path: 'shipping-way-type-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ShippingWayTypeDetails', Permission: PermissionsEnum.ShippingWayTypes },
        component: containers.ShippingWayTypeDetailsContainer
      },
      {
        path: 'states',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.States', Permission: PermissionsEnum.States },
        component: containers.StateListContainer
      },
      {
        path: 'state-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.StateDetails', Permission: PermissionsEnum.States },
        component: containers.StateDetailsContainer
      },
      {
        path: 'zones',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Zones', Permission: PermissionsEnum.Zones },
        component: containers.ZoneListContainer
      },
      {
        path: 'zone-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ZoneDetails', Permission: PermissionsEnum.Zones },
        component: containers.ZoneDetailsContainer
      },
      {
        path: '', pathMatch: 'full', redirectTo: '/general/areas',
      }
    ]
  },
  {
    path: '', pathMatch: 'full', redirectTo: '/general/areas',
  }
];

@NgModule({
  imports: [RouterModule.forChild(GENERAL_ROUTES)],
  exports: [RouterModule],
})
export class GeneralRoutingModule { }
