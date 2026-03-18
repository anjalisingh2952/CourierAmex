import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SharedModule } from '@app/@shared';
import * as containers from './containers';
import { PaymentRoutingModule } from './payment.routing';
import * as services from './services';
import { PendingInvoicesCustomerComponent } from './components/pending-invoices-customer/pending-invoices-customer.component';
import { InvoiceModule } from '../invoice/invoice.module';
import { PendingInvoicePackagesComponent } from './components/pending-invoice-packages/pending-invoice-packages.component';
import { PaymentModelComponent } from './components/payment-model/payment-model.component';
import { SaleSummaryComponent } from './components/sale-summary/sale-summary.component';
@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        NgxSkeletonLoaderModule,
        PaymentRoutingModule,
        InvoiceModule
    ],
    providers: [
        ...services.PAYMENT_SERVICES
    ],
    declarations: [
        ...containers.DELIVERY_PFOOF,
        ...containers.POINT_OF_SALE
    ]
})
export class PaymentModule { }
