import { InvoiceService } from '@app/features/invoice/services';
import { PaymentService } from './payment.service';
import { CustomerService } from '@app/features/customer';
import { PrinterService } from '@app/@core/services/printer.service';
import { ClientCashierService } from '@app/features/company';

export const PAYMENT_SERVICES = [
    PaymentService,
    InvoiceService,
    CustomerService,
    PrinterService
];

export * from './payment.service';