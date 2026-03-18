import { InvoiceService } from './invoice.service';
import { CompanyInvoiceService } from './generate-invoice.service';

export const INVOICE_SERVICES = [
    InvoiceService,
    CompanyInvoiceService
];

export * from './invoice.service';
export * from './generate-invoice.service';