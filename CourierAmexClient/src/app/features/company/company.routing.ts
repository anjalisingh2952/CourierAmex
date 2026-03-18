import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CashierDetailsComponent } from './containers/cashiers/cashier-details/cashier-details.component';
import { CashierListComponent } from './containers/cashiers/cashier-list/cashier-list.component';
import { hasViewPermissionActivateChild, isAuthenticatedActivateChild } from '@app/@core';
import { EmptyComponent } from '@app/@shared';
import { PermissionsEnum } from '@app/models';
import * as containers from './containers';
import { ExchangeRateListComponent } from './containers/exchange-rate';

export const COMPANY_ROUTES: Routes = [
  {
    path: '',
    canActivate: [isAuthenticatedActivateChild],
    data: { breadcrumb: 'Sidebar.Company' },
    component: EmptyComponent,
    children: [
      {
        path: 'list',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Companies', Permission: PermissionsEnum.Companies },
        component: containers.CompanyListContainer
      },
      {
        path: 'details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.CompanyDetails', Permission: PermissionsEnum.Companies },
        component: containers.CompanyDetailsContainer
      },
      {
        path: 'categories',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ClientCategories', Permission: PermissionsEnum.ClientCategories },
        component: containers.ClientCategoryListContainer
      },
      {
        path: 'category-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ClientCategoryDetails', Permission: PermissionsEnum.ClientCategories },
        component: containers.ClientCategoryDetailsContainer
      },
      {
        path: 'supplier-list',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Suppliers', Permission: PermissionsEnum.Suppliers },
        component: containers.SupplierListContainer
      },
      {
        path: 'supplier-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.SupplierDetails', Permission: PermissionsEnum.Suppliers },
        component: containers.SupplierDetailsContainer
      },
      {
        path: 'location-list',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Locations', Permission: PermissionsEnum.Locations },
        component: containers.LocationListContainer
      },
      {
        path: 'location-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.LocationDetails', Permission: PermissionsEnum.Locations },
        component: containers.LocationDetailsContainer
      },
      {
        path: 'pay-types',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.CustomerPayTypes', Permission: PermissionsEnum.CustomerPayTypes },
        component: containers.CustomerPayTypeListContainer
      },
      {
        path: 'paytype-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.CustomerPayTypeDetails', Permission: PermissionsEnum.CustomerPayTypes },
        component: containers.CustomerPayTypeDetailsContainer
      },
      {
        path: 'document-types',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.DocumentTypes', Permission: PermissionsEnum.DocumentTypes },
        component: containers.DocumentTypeListContainer
      },
      {
        path: 'document-type-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.DocumentTypeDetails', Permission: PermissionsEnum.DocumentTypes },
        component: containers.DocumentTypeDetailsContainer
      },
      {
        path: 'commodities',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Commodities', Permission: PermissionsEnum.Commodities },
        component: containers.CommodityListContainer
      },
      {
        path: 'commodity-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.CommodityDetails', Permission: PermissionsEnum.Commodities },
        component: containers.CommodityDetailsContainer
      },
      {
        path: 'cashiers',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.Cashiers', Permission: PermissionsEnum.Cashiers },
        component: CashierListComponent
      },
      {
        path: 'cashier-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ClientCashierDetails', Permission: PermissionsEnum.Cashiers },
        component: CashierDetailsComponent
      },
      {
        path: '', pathMatch: 'full', redirectTo: '/company/categories',
      },
      {
        path: 'document-pay-types',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.DocumentPayTypes', Permission: PermissionsEnum.DocumentPayTypes },
        component: containers.DocumentPayTypeListContainer
      },
      {
        path: 'document-pay-type-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.DocumentPayTypes', Permission: PermissionsEnum.DocumentPayTypes },
        component: containers.DocumentPayTypeDetailsContainer
      },
      {
        path: 'payment-types',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PaymentTypes', Permission: PermissionsEnum.PaymentTypes },
        component: containers.PaymentTypeListContainer
      },
      {
        path: 'payment-type-details',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.PaymentTypeDetails', Permission: PermissionsEnum.PaymentTypes },
        component: containers.PaymentTypeDetailsContainer
      },
      {
        path: 'exchange-rate',
        canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
        data: { breadcrumb: 'Sidebar.ExchangeRateList', Permission: PermissionsEnum.PaymentTypes },
        component: ExchangeRateListComponent
      }
    ]
  },
  {
    path: '', pathMatch: 'full', redirectTo: '/company/categories',
  }
];

@NgModule({
  imports: [RouterModule.forChild(COMPANY_ROUTES)],
  exports: [RouterModule],
})
export class CompanyRoutingModule { }
