export const InvoiceModel = {
    id: 0,
    companyId: 0,
    number: undefined,
    code: '',
    fullName: '',
    companyName: '',
    courierName: '',
    trackingNumber: '',
    status: 0,
    volumetricWeight: 0,
    manifestId: 0,
    hasInvoice: false,
    taxType: 0
};

export const filterData = {
    clientId: '',
    fromDate: '',
    toDate: '',
    filters: ''
};

export interface Invoice {
    invoiceNumber: number | null;
    user: string;
    cashRegisterID: number;
    client: string;
    date: string;
    taxableAmount: number;
    exemptAmount: number | null;
    customsTax: number | null;
    salesTax: number;
    subtotal: number;
    discount: number;
    total: number;
    totalLocal: number;
    balance: number;
    localBalance: number;
    paidAmount: number;
    change: number;
    paymentMethodID: number;
    paymentType: string | null;
    status: number;
    fullName: string | null;
    exchangeRatePurchase: number;
    exchangeRateSale: number;
    note: string | null;
    type: string | null;
    key: string | null;
    productID: number;
    quantity: number;
    price: number;
    description: string;
    productType: string | null;
    isExempt: boolean;
    hasCustomsTax: boolean;
    documentNumber: string;
    creditNote: string | null;
    documentType: string;
    selected?: boolean;
}

export interface CreditNoteInsertRequestModel {
    reconciliationId: number;
    companyId: number;
    clientOrSupplierType: string;
    clientOrSupplierCode: string;
    currencyCode: number;
    exchangeRate: number;
    amount: number;
    observation: string;
    status: string;
    systemDate: string; 
    transactionDate: string;
    category: number;
    modifiedByUserId: number;
    invoiceNumber: number;
    creditNoteAction: string;
    invoiceAmountInDollars: number;
    invoiceAmountInColones: number;
    accountingEntryCode: string;
    applyElectronicInvoice: number;
  }