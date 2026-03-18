import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { hasViewPermissionActivateChild, isAuthenticatedActivateChild } from '@app/@core';
import { EmptyComponent } from '@app/@shared';
import { PermissionsEnum } from '@app/models';
import * as containers from './containers';

export const INVOICE_ROUTES: Routes = [
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Invoice' },
        component: EmptyComponent,
        children: [
            {
                path: 'invoice-history',
                canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
                data: { breadcrumb: 'Sidebar.InvoiceHistory', Permission: PermissionsEnum.InvoiceHistory },
                component: containers.InvoiceHistoryComponent
            },
            {
                path: 'invoice-report',
                canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
                data: { breadcrumb: 'Sidebar.GenerateReport', Permission: PermissionsEnum.GenerateReport },
                component: containers.InvoicesReportGenerateComponent
            },
            {
                path: 'invoice-report/:id',
                canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
                data: { breadcrumb: 'Sidebar.GenerateReport', Permission: PermissionsEnum.GenerateReport },
                component: containers.InvoicesReportGenerateComponent
            }
            ,
            {
                path: 'generate-invoice',
                canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
                data: { breadcrumb: 'Sidebar.GenerateReport', Permission: PermissionsEnum.GenerateReport },
                component: containers.GenerateInvoiceComponent
            },
            {
                path: 'load-customs-taxex',
                canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
                data: { breadcrumb: 'Sidebar.LoadCustomsTaxex', Permission: PermissionsEnum.GenerateReport },
                component: containers.LoadCustomsTaxexComponent
            },
            {
                path: 'aeropost-mass-upload',
                canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
                data: { breadcrumb: 'Sidebar.AeropostMassUpload', Permission: PermissionsEnum.GenerateReport },
                component: containers.AeropostMassUploadComponent
            },
            

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(INVOICE_ROUTES)],
    exports: [RouterModule],
})
export class InvoiceRoutingModule { }