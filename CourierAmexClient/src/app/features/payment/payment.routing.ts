import { Component, NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { hasViewPermissionActivateChild, isAuthenticatedActivateChild } from '@app/@core';
import { EmptyComponent } from '@app/@shared';
import { PermissionsEnum } from '@app/models';
import * as containers from './containers';

export const PAYMENT_ROUTES: Routes = [
    {
        path: '',
        canActivate: [isAuthenticatedActivateChild],
        data: { breadcrumb: 'Sidebar.Payment' },
        component: EmptyComponent,
        children: [
            {
                path: 'generate-delivery-proof',
                canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
                data: { breadcrumb: 'Sidebar.Payment', Permission: PermissionsEnum.DeliveryProof },
                component: containers.DeliveryProofComponent
            },
            {
                path: 'open-close-point-of-sale',
                canActivate: [isAuthenticatedActivateChild, hasViewPermissionActivateChild],
                data: { breadcrumb: 'Payment.PointOfSale', Permission: PermissionsEnum.PointOfSale },
                component: containers.OpenClosePointOfSaleComponent
            }]
    }
]

@NgModule({
    imports: [RouterModule.forChild(PAYMENT_ROUTES)],
    exports: [RouterModule],
})
export class PaymentRoutingModule { }