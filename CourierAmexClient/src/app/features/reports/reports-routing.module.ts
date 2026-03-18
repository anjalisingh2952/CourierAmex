import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { hasViewPermissionActivateChild, isAuthenticatedActivateChild } from '@app/@core';
import { EmptyComponent } from '@app/@shared';
import { PermissionsEnum } from '@app/models';
import * as containers from './containers';

export const REPORTS_ROUTES: Routes = [
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Reports' },
        component: EmptyComponent,
        children: [
            {
                path: 'manifest-reports',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.Reports', Permission: PermissionsEnum.ManifestReports },
                component: containers.ManifestReportComponent
            },
        ]

    },
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Invoice' },
        component: EmptyComponent,
        children: [
            {
                path: 'credit-pending',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.CreditPending', Permission: PermissionsEnum.ManifestReports },
                component: containers.CreditPendingComponent
            },
        ]

    },
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Packages' },
        component: EmptyComponent,
        children: [
            {
                path: 'pending-manifest-or-pre-study',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.PendingManifestPreStudy', Permission: PermissionsEnum.ManifestReports },
                component: containers.PendingManifestOrPreStudyComponent
            },
        ]

    },
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Manifest' },
        component: EmptyComponent,
        
        children: [
            {
                path: 'courier-deconsolidation',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.CourierDeconsolidation', Permission: PermissionsEnum.ManifestReports },
                component: containers.CourierDeconsolidationComponent
            },
        ]

    }
    ,
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Manifest' },
        component: EmptyComponent,
        children: [
            {
                path: 'detailed-billing',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.CourierDeconsolidation', Permission: PermissionsEnum.ManifestReports },
                component: containers.DetailedBillingComponent
            },
        ]

    },
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Manifest' },
        component: EmptyComponent,
        children: [
            {
                path: 'manifest-report-observations',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.ManifestReportObservations', Permission: PermissionsEnum.ManifestReports },
                component: containers.ManifestReportObservationsComponent
            },
        ]

    },{
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Manifest' },
        component: EmptyComponent,
        children: [
            {
                path: 'manifest-report-by-bag',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.ManifestReportByBag', Permission: PermissionsEnum.ManifestReports },
                component: containers.ManifestReportByBagComponent
            },
        ]

    },{
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Manifest' },
        component: EmptyComponent,
        children: [
            {
                path: 'courier-consolidated',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.CourierConsolidated', Permission: PermissionsEnum.ManifestReports },
                component: containers.CourierConsolidatedComponent
            },
        ]

    }
    ,
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Invoice' },
        component: EmptyComponent,
        children: [
            {
                path: 'summary',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.Summary', Permission: PermissionsEnum.ManifestReports },
                component: containers.SummaryComponent
            },
        ]

    },
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Invoice' },
        component: EmptyComponent,
        children: [
            {
                path: 'pending-invoices',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.PendingInvoices', Permission: PermissionsEnum.ManifestReports },
                component: containers.PendingInvoicesComponent
            },
        ]

    },
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Invoice' },
        component: EmptyComponent,
        children: [
            {
                path: 'sales-detail',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.SalesDetail', Permission: PermissionsEnum.ManifestReports },
                component: containers.SalesDetailComponent
            },
        ]

    },
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Suppliers' },
        component: EmptyComponent,
        children: [
            {
                path: 'purchases',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.Purchases', Permission: PermissionsEnum.ManifestReports },
                component: containers.PurchasesComponent
            },
        ]
    },
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Invoice' },
        component: EmptyComponent,
        children: [
            {
                path: 'customs-taxes',
                canActivate: [isAuthenticatedActivateChild],
                data: { breadcrumb: 'Sidebar.CustomsTaxes', Permission: PermissionsEnum.ManifestReports },
                component: containers.CustomsTaxesComponent
            },
        ]
    }

    

    

]

@NgModule({
    imports: [RouterModule.forChild(REPORTS_ROUTES)],
    exports: [RouterModule],
})
export class ReportsRoutingModule { }
