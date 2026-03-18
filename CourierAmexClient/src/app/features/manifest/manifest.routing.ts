import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { hasViewPermissionActivateChild, isAuthenticatedActivateChild } from '@app/@core';
import { EmptyComponent } from '@app/@shared';
import { PermissionsEnum } from '@app/models';
import * as containers from './containers';

export const MANIFEST_ROUTES: Routes = [
  {
    path: '',
    canActivate: [isAuthenticatedActivateChild],
    data: { breadcrumb: 'Sidebar.Manifest' },
    component: EmptyComponent,
    children: [
      {
        path: 'list',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Manifests', Permission: PermissionsEnum.Manifests },
        component: containers.ManifestListContainer
      },
      {
        path: 'details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ManifestDetails', Permission: PermissionsEnum.Manifests },
        component: containers.ManifestDetailsContainer
      },
      {
        path: 'air-classify',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.AirClassify', Permission: PermissionsEnum.AirClassify },
        component: containers.AirClassifyComponent
      },
      {
        path: 'package-scanning',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackageScanning', Permission: PermissionsEnum.AirClassify },
        component: containers.PackageScanningComponent
      },
      {
        path: 'manage-route-sheet',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ManagePackagesRoute', Permission: PermissionsEnum.ManagePackagesRoute },
        component: containers.ManageRouteSheetComponent
      },
      {
        path: 're-open-roadmap',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ReOpenRoadMap', Permission: PermissionsEnum.ReOpenRoadmap },
        component: containers.ReopenRoadmapComponent
      },
      {
        path: '', pathMatch: 'full', redirectTo: '/manifest/list',
      }
    ]
  },
  {
    path: '', pathMatch: 'full', redirectTo: '/manifest/list',
  }
];

@NgModule({
  imports: [RouterModule.forChild(MANIFEST_ROUTES)],
  exports: [RouterModule],
})
export class ManifestRoutingModule { }
