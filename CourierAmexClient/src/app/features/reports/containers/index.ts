//import { ManifestReportComponent } from "./manifest/manifest-report.component"
import { CreditPendingComponent } from "./invoice/credit-pending/credit-pending.component"
import { InvoiceComponent } from "./invoice/invoice.component"
import { PackagesReportComponent} from "./packages-report/packages-report.component"
import { PendingManifestOrPreStudyComponent } from "./packages-report/pending-manifest-or-pre-study/pending-manifest-or-pre-study.component"
import { CourierDeconsolidationComponent} from "./manifest/courier-deconsolidation/courier-deconsolidation.component"
import { DetailedBillingComponent } from "./manifest/detailed-billing/detailed-billing.component"
//import {ManifestReportComponent} from './manifest/manifest-report.component'
import { ManifestReportObservationsComponent} from "./manifest/manifest-report-observations/manifest-report-observations.component"
import { SummaryComponent} from "./invoice/summary/summary.component"
import { PendingInvoicesComponent } from "./invoice/pending-invoices/pending-invoices.component"
import { SalesDetailComponent } from "./invoice/sales-detail/sales-detail.component"
import { ManifestReportByBagComponent } from "./manifest/manifest-report-by-bag/manifest-report-by-bag.component"
import { CourierConsolidatedComponent } from "./manifest/courier-consolidated/courier-consolidated.component"
import { PurchasesComponent } from "./suppliers/purchases/purchases.component"
import { CustomsTaxesComponent } from "./invoice/customs-taxes/customs-taxes.component"
export const Manifest_Report = [
    //ManifestReportComponent,
    InvoiceComponent,
    CreditPendingComponent,
    PackagesReportComponent,
    PendingManifestOrPreStudyComponent,
    CourierDeconsolidationComponent,
    DetailedBillingComponent,
    ManifestReportObservationsComponent,
    SummaryComponent,
    PendingInvoicesComponent,
    SalesDetailComponent,
    ManifestReportByBagComponent,
    CourierConsolidatedComponent,
    PurchasesComponent,
    CustomsTaxesComponent
]

export * from './manifest/manifest-report.component'
export * from './invoice/invoice.component'
export * from './invoice/credit-pending/credit-pending.component'
export * from './packages-report/packages-report.component'
export * from './packages-report/pending-manifest-or-pre-study/pending-manifest-or-pre-study.component'
export * from './manifest/courier-deconsolidation/courier-deconsolidation.component'
export * from './manifest/detailed-billing/detailed-billing.component'
export * from  './manifest/manifest-report-observations/manifest-report-observations.component'
export * from './invoice/summary/summary.component'
export * from './invoice/pending-invoices/pending-invoices.component'
export * from './invoice/sales-detail/sales-detail.component'
export * from './manifest/manifest-report-by-bag/manifest-report-by-bag.component'
export * from './manifest/courier-consolidated/courier-consolidated.component'
export * from './suppliers/purchases/purchases.component';
export * from './invoice/customs-taxes/customs-taxes.component'