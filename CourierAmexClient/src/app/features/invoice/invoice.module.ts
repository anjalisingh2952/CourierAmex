import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceHistoryComponent } from './containers/invoice-history/invoice-history.component';
import { SharedModule } from '@app/@shared';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import * as services from './services';
import { InvoiceRoutingModule } from './invoice.routing';
import { CustomerDetailComponent } from './components/invoice-history/customer-detail/customer-detail.component';
import { PackageService } from '../package/services';
import { InvoicesCraditsListComponent } from './components/invoice-history/invoices-cradits-list/invoices-cradits-list.component';
import { InvoicesPackagesComponent } from './components/invoice-history/invoices-packages/invoices-packages.component';
import { CustomerService } from '../customer';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { InvoicesReportGenerateComponent } from './containers/invoices-report-generate/invoices-report-generate.component';
import { GenerateInvoiceComponent } from './containers/generate-invoice/generate-invoice.component';
import { MessageService } from '@app/@core';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';  // Import ButtonModule
import { TreeTableModule } from 'primeng/treetable';
import { InputTextModule } from 'primeng/inputtext'; 
import { DropdownModule } from 'primeng/dropdown'; 
import { FormsModule } from '@angular/forms'; 
import { StyleClassModule } from 'primeng/styleclass';
import { ReportsService } from '../reports/services';
import { PaymentService } from '../payment/services';
import { ExchangeRateService } from '../company/services/exchange-rate.service';
import { LoadCustomsTaxexComponent } from './containers/load-customs-taxex/load-customs-taxex.component';
import { AeropostMassUploadComponent } from './containers/aeropost-mass-upload/aeropost-mass-upload.component';
@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    InvoiceRoutingModule,
    NgxSkeletonLoaderModule,
    TableModule,
    ButtonModule,
    TreeTableModule,
    InputTextModule,
    DropdownModule,
    FormsModule,
    StyleClassModule,
    CheckboxModule
  ],
  declarations: [
    InvoiceHistoryComponent,
    CustomerDetailComponent,
    InvoicesCraditsListComponent,
    InvoicesPackagesComponent,
    InvoicesReportGenerateComponent,
    GenerateInvoiceComponent,
    LoadCustomsTaxexComponent,
    AeropostMassUploadComponent
  ],
  providers: [
    ...services.INVOICE_SERVICES,
    PackageService,
    CustomerService,
    NgbActiveModal,
    CustomerDetailComponent,
    MessageService,
    ReportsService,
    PaymentService,
    ExchangeRateService
  ],
  exports: [InvoicesCraditsListComponent]
})
export class InvoiceModule { }