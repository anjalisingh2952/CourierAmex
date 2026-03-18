export interface PointOfSaleDetail {
  companyId: number;
  openingCode: number;
  id: number;
  paymentId: number;
  userName: string;
  pointOfSaleId: number;
  changeInDollar: number;
  changeInLocal: number;
  date: string; // or use Date if you parse it
  reference: string;
  totalDoller: number;
  totalLocal: number;
  paidAmount: number;
  currencyCode: string;
  paymentType: string;
  client: string | null;
  invoiceIds: string | null;
  subPaymentDescription: string | null;
  paymentTypeDescription: string | null;
}

export interface AggregatedResult {
  TotalDollerSum: number;
  TotalLocalSum: number;
  PaidLocal: number;
  PaidDollar: number;
  TotalChangeInLocal: number;
  TotalChangeInDollar: number;
  TotalLocalOnClosing: number;
  TotalDollarsOnClosing: number;
  CashOutAmountLocal: number;
  CashOutAmountDollar: number;
  CashInAmountLocal: number;
  CashInAmountDollar: number;
}