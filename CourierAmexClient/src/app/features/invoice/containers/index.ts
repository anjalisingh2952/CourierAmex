import { InvoiceHistoryComponent } from "./invoice-history/invoice-history.component";
import { InvoicesReportGenerateComponent } from "./invoices-report-generate/invoices-report-generate.component";
import { GenerateInvoiceComponent } from "./generate-invoice/generate-invoice.component";
import { LoadCustomsTaxexComponent } from "./load-customs-taxex/load-customs-taxex.component";
import { AeropostMassUploadComponent } from "./aeropost-mass-upload/aeropost-mass-upload.component";
export const MANIFEST_CONTAINERS = [
    InvoiceHistoryComponent,
    InvoicesReportGenerateComponent,
    GenerateInvoiceComponent,
    LoadCustomsTaxexComponent,
    AeropostMassUploadComponent
];

export * from './invoice-history/invoice-history.component';
export * from './invoices-report-generate/invoices-report-generate.component';
export * from './generate-invoice/generate-invoice.component';
export * from './load-customs-taxex/load-customs-taxex.component';
export * from './aeropost-mass-upload/aeropost-mass-upload.component';