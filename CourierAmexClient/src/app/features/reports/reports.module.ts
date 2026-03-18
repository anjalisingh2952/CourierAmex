import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';
import { SharedModule } from '@app/@shared';
import * as containers from './containers';
import { ReportsRoutingModule } from './reports-routing.module';
import * as services from './services';
import { CustomerService } from '../customer';
import { ManifestReportComponent } from './containers/manifest/manifest-report.component';
import { ReportViewerComponent } from './containers/manifest/manifest-report/report-viewer/report-viewer.component';
import { ManifestService } from '../manifest/services/manifest.service';
import { InvoiceComponent } from './containers/invoice/invoice.component';
import { CreditPendingComponent } from './containers/invoice/credit-pending/credit-pending.component';
import { ZoneService } from '@app/features/general/services/zone.service';
import { PendingManifestOrPreStudyComponent } from './containers/packages-report/pending-manifest-or-pre-study/pending-manifest-or-pre-study.component';
import { PackagesReportComponent } from './containers/packages-report/packages-report.component';
import { CourierDeconsolidationComponent } from './containers/manifest/courier-deconsolidation/courier-deconsolidation.component';
import { DetailedBillingComponent } from './containers/manifest/detailed-billing/detailed-billing.component';
import { manifestdetailsComponent } from './components/manifest/manifest-details.component';
import { manifestsupplierComponent } from './components/manifest/manifest-supplier.component';
import { manifestaverageComponent } from './components/manifest/manifest-average.component';
import { MultiSelectModule } from 'primeng/multiselect';
import { PrimeNGConfig } from 'primeng/api';  // Configuration module
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';  // Import ButtonModule
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { CustomerPayTypeService } from '../../features/company/services/customer-pay-type.service';

@NgModule({
    imports: [
        CommonModule,
        SharedModule,
        NgxSkeletonLoaderModule,
        ReportsRoutingModule,
        MultiSelectModule,
        TableModule,
        ButtonModule,
        InputTextModule,
        FormsModule
    ],
    providers: [
        ...services.REPORTS_SERVICES,
        CustomerService,
        ManifestService,
        ZoneService,
        PrimeNGConfig,
        ToastModule,
        CustomerPayTypeService
    ],
    declarations: [
        ...containers.Manifest_Report,
        ManifestReportComponent,
        ReportViewerComponent,
        InvoiceComponent,
        CreditPendingComponent,
        PackagesReportComponent,
        PendingManifestOrPreStudyComponent,
        CourierDeconsolidationComponent,
        DetailedBillingComponent,
        manifestdetailsComponent,
        manifestsupplierComponent,
        manifestaverageComponent
    ]
})
export class ReportsModule { }