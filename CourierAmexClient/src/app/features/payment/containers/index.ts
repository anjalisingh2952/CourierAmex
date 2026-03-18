import { GenerateDeliveryProofComponent } from "../components/generate-delivery-proof/generate-delivery-proof.component"
import { OpenClosePointOfSaleFormComponent } from "../components/open-close-point-of-sale-form/open-close-point-of-sale-form.component"
import { PaymentModelComponent } from "../components/payment-model/payment-model.component"
import { PendingInvoicePackagesComponent } from "../components/pending-invoice-packages/pending-invoice-packages.component"
import { PendingInvoicesCustomerComponent } from "../components/pending-invoices-customer/pending-invoices-customer.component"
import { SaleSummaryComponent } from "../components/sale-summary/sale-summary.component"
import { DeliveryProofComponent } from "./delivery-proof/delivery-proof.component"
import { OpenClosePointOfSaleComponent } from "./open-close-point-of-sale/open-close-point-of-sale.component"

export const DELIVERY_PFOOF = [
    DeliveryProofComponent,
    GenerateDeliveryProofComponent,
]

export const POINT_OF_SALE = [
    OpenClosePointOfSaleComponent,
    OpenClosePointOfSaleFormComponent,
    PendingInvoicesCustomerComponent,
    PendingInvoicePackagesComponent,
    PaymentModelComponent,
    SaleSummaryComponent
]

export * from './delivery-proof/delivery-proof.component'
export * from './open-close-point-of-sale/open-close-point-of-sale.component'