import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { hasViewPermissionActivateChild, isAuthenticatedActivateChild } from '@app/@core';
import { EmptyComponent } from '@app/@shared';
import { PermissionsEnum } from '@app/models';
import * as containers from './containers';
import { EventListComponent } from './containers/events/event-list/event-list.component';
import { PackageCategoryComponent } from './containers/package-category/package-category.component';
import { PackageClassifyComponent } from './containers/package-classify/package-classify.component';
import { PackageLogNotesComponent } from './containers/package-lognotes/package-lognotes-list/package-lognotes-list.component';
import { PackageNotesListContainer } from './containers/package-notes/package-notes-list/package-notes-list.container';
import { PackingPackagesComponent } from './containers/packing-packages/packing-packages.component';
import { AssignPricesComponent } from './containers/assign-prices/assign-prices.component';
import { PreStudyComponent } from './containers/pre-study/pre-study.component';

export const PACKAGE_ROUTES: Routes = [
  {
    path: '',
    canActivate: [isAuthenticatedActivateChild],
    data: { breadcrumb: 'Sidebar.Package' },
    component: EmptyComponent,
    children: [
      {
        path: 'list',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Packages', Permission: PermissionsEnum.Packages },
        component: containers.PackageListContainer
      },
      {
        path: 'details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackageDetails', Permission: PermissionsEnum.Packages },
        component: containers.PackageDetailsContainer
      },
      {
        path: 'event-list',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ListPackageEvents', Permission: PermissionsEnum.PackageEvents },
        component: EventListComponent
      },
      {
        path: 'package-category',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackageCategory', Permission: PermissionsEnum.PackageCategory },
        component: PackageCategoryComponent
      },
      {
        path: 'package-classify',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackageClassify', Permission: PermissionsEnum.PackageClassify },
        component: PackageClassifyComponent
      },
      {
        path: 'package-lognotes',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackageLogNotes', Permission: PermissionsEnum.PackageLogNotes },
        component: PackageLogNotesComponent
      },
      {
        path: 'package-notes',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackageNotes', Permission: PermissionsEnum.PackageNotes },
        component: PackageNotesListContainer
      },
      {
        path: 'packing-packages-aeropost',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackingPackagesAeropost', Permission: PermissionsEnum.PackingPackageAeropost },
        component: PackingPackagesComponent
      },
      {
        path: 'packing-packages-courier',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackingPackagesCourier', Permission: PermissionsEnum.PackingPackageCourier },
        component: PackingPackagesComponent
      },
      {
        path: 'packing-packages-consolidated',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackingPackagesConsolidated', Permission: PermissionsEnum.PackingPackageConsolidate },
        component: PackingPackagesComponent
      },{
        path: 'package-assign-prices',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackageAssignPrices', Permission: PermissionsEnum.PackingPackageConsolidate },
        component: AssignPricesComponent
      },
      {
        path: 'pre-study',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackagePreStudy', Permission: PermissionsEnum.PackingPackageConsolidate },
        component: PreStudyComponent
      },{
        path: 'package-inventory',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PackageInventory', Permission: PermissionsEnum.PackingPackageConsolidate },
        component: containers.PackageInventoryComponent
      },{
        path: 'has-invoice-maintenance',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.HasInvoiceMaintenance', Permission: PermissionsEnum.PackingPackageConsolidate },
        component: containers.HasInvoiceMaintenanceComponent
      },{
        path: 'price-image-maintenance',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PriceImageMaintenance', Permission: PermissionsEnum.PackingPackageConsolidate },
        component: containers.PriceImageMaintenanceComponent
      },

      {
        path: '', pathMatch: 'full', redirectTo: '/package/list',
      }
    ]
  },
  {
    path: '', pathMatch: 'full', redirectTo: '/package/list',
  }
];

@NgModule({
  imports: [RouterModule.forChild(PACKAGE_ROUTES)],
  exports: [RouterModule],
})
export class PackageRoutingModule { }
