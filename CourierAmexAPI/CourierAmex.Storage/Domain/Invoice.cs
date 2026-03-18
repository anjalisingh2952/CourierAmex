using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace CourierAmex.Storage.Domain
{
    public class Invoice
    {
        public string InvoiceNumber { get; set; } // FACTURA
        public string User { get; set; } // USUARIO
        public int CashRegisterID { get; set; } // CAJA_ID
        public string Client { get; set; } // CLIENTE
        public string PointOfSale { get; set; } // CLIENTE
        public DateTime Date { get; set; } // FECHA
        public decimal TaxableAmount { get; set; } // MONTOGRAVADO
        public decimal? ExemptAmount { get; set; } // MONTOEXENTO
        public decimal? CustomsTax { get; set; } // IMPUESTOADUANAS
        public decimal? SalesTax { get; set; } // IMPUESTOVENTAS
        public decimal Subtotal { get; set; } // SUBTOTAL
        public decimal Discount { get; set; } // DESCUENTO
        public decimal Total { get; set; } // TOTAL
        public decimal TotalLocal { get; set; } // TOTALLOCAL
        public decimal? Balance { get; set; } // SALDO
        public decimal? LocalBalance { get; set; } // SALDOLOCAL
        public decimal PaidAmount { get; set; } // PAGADO
        public decimal Change { get; set; } // CAMBIO
        public int PaymentMethodID { get; set; } // FORMAPAGO_ID
        public string PaymentType { get; set; } // TIPOPAGO
        public int Status { get; set; } // ESTADO
        public string FullName { get; set; } // NOMBRECOMPLETO
        public decimal ExchangeRatePurchase { get; set; } // TIPO_CAMBIO_COMPRA
        public decimal ExchangeRateSale { get; set; } // TIPO_CAMBIO_VENTA
        public string Note { get; set; } // Nota
        public string Type { get; set; } // TIPO
        public string Key { get; set; } // Clave
        public int ProductID { get; set; } // PRODUCTO_ID
        public int Quantity { get; set; } // CANTIDAD
        public decimal Price { get; set; } // PRECIO
        public string Description { get; set; } // DESCRIPCION
        public string ProductType { get; set; } // Tipo de producto
        public bool IsExempt { get; set; } = false; // EXENTO
        public bool HasCustomsTax { get; set; } = false; // ESIMPUESTOADUANA
        public string DocumentNumber { get; set; } // FACTURA
        public string CreditNote { get; set; } // [dbo].[FC_GETNOTACREDITO](F.N_FACTURA )
        public string DocumentType { get; set; } // DocumentType
        public string SubPaymentType { get; set; } // DocumentType
        public string Reference { get; set; } // DocumentType
        public string Currency { get; set; }
    }

    public class InvoiceDetails
    {
        public string InvoiceNumber { get; set; }
        public int PackageId { get; set; }
        public string PackageNumber { get; set; }
        public string ClientCode { get; set; }
        public string CourierCode { get; set; }
        public string CourierName { get; set; }
        public string Origin { get; set; }
        public string Observations { get; set; }
        public decimal? Insurance { get; set; }
        public string Country { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public int Packages { get; set; }
        public int StatusId { get; set; }
        public string Description { get; set; }
        public decimal Weight { get; set; }
        public decimal Price { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal Length { get; set; }
        public decimal VolumetricWeight { get; set; }
        public string ReceivedBy { get; set; }
        public int DestinationId { get; set; }
        public string PackageType { get; set; }
        public string COD { get; set; }
        public int Invoiced { get; set; }
        public int Pallets { get; set; }
        public int Bag { get; set; }
        public decimal TotalKilos { get; set; }
        public string Type { get; set; }
        public string TotalLabels { get; set; }
        public string PackagingDetails { get; set; }
        public int RetrievedByClient { get; set; }
        public int TaxType { get; set; }
        public string CourierType { get; set; }
        public string SubPackageType { get; set; }
        public string FullName { get; set; }
    }
    public class PaymentInfo
    {
        public int Id { get; set; }
        public DateTime PaymentDate { get; set; }
        public string User { get; set; }
        public string Currency { get; set; }
        public decimal Paid { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public decimal Total { get; set; }
        public decimal LocalTotal { get; set; }
        public decimal Balance { get; set; }
        public decimal LocalBalance { get; set; }
        public string Status { get; set; }
        public decimal PaidBankCommission { get; set; }
        public decimal PaidSalesTax { get; set; }
        public decimal PaidAdvanceRental { get; set; }
        public decimal BankCommission { get; set; }
        public decimal SalesTax { get; set; }
        public decimal AdvanceRental { get; set; }
        public decimal ExchangeRate { get; set; }
    }

    public class PendingInvoiceReport
    {
        public string CustomerCode { get; set; }
        public string CustomerFullName { get; set; }
        public string PaymentType { get; set; }
        public string Zone { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string InvoiceStatus { get; set; }
        public decimal Total { get; set; }
        public decimal TotalLocal { get; set; }
        public decimal Balance { get; set; }
        public decimal LocalBalance { get; set; }
        public string Stop { get; set; }
    }



    public class SalesReport
    {
        public string InvoiceNumber { get; set; }
        public DateTime IssueDate { get; set; }
        public string InvoiceType { get; set; }
        public string CustomerName { get; set; }
        public string DetailLineDescription { get; set; }
        public int DetailLineQuantity { get; set; }
        public string CurrencyCode { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal TaxRate { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal TotalLineAmount { get; set; }
        public decimal CurrencyExchangeRate { get; set; }
        public string Response { get; set; }
        public string PaymentMethod { get; set; }
        public string SaleCondition { get; set; }
        public string OtherChargesDescription { get; set; }
        public decimal OtherChargesAmount { get; set; }

    }


    public class CreditNoteInsertRequest
    {
        public int? ReconciliationId { get; set; }
        public int? CompanyId { get; set; }
        public string? ClientOrSupplierType { get; set; }
        public string? ClientOrSupplierCode { get; set; }
        public int? CurrencyCode { get; set; }
        public decimal? ExchangeRate { get; set; }
        public decimal? Amount { get; set; }
        public string? Observation { get; set; }
        public string? Status { get; set; }
        public DateTime? SystemDate { get; set; }
        public DateTime? TransactionDate { get; set; }
        public int? Category { get; set; }
        public int? ModifiedByUserId { get; set; }
        public int? InvoiceNumber { get; set; }
        public string? CreditNoteAction { get; set; }
        public decimal? InvoiceAmountInDollars { get; set; }
        public decimal? InvoiceAmountInColones { get; set; }
        public string? AccountingEntryCode { get; set; }
        public int? ApplyElectronicInvoice { get; set; }
    }



    public class CustomsTaxLoad
    {

        public string crtrack { get; set; }
        public string transaction { get; set; }
        public decimal fob { get; set; }
        public decimal cif { get; set; }
        public decimal amount { get; set; }
        public string dua { get; set; }
        public string loadType { get; set; }
        public int companyId { get; set; }
        public string createdBy { get; set; }
        public DateTime createdDate { get; set; }
   
    }


    public class AeropostMassUploadReport
    {
        public string Invoice { get; set; }
        public string ProviderName { get; set; }
        public string GLDetail { get; set; }
        public DateTime ReportDate { get; set; }
        public string Currency { get; set; }
        public decimal Subtotal { get; set; }
        public decimal VAT { get; set; }
        public decimal Exempt { get; set; }
        public decimal Taxable { get; set; }
        public decimal Parafiscal { get; set; }
        public decimal Total { get; set; }
    }


    public class TemplateAccount
    {
        public int CompanyId { get; set; }            // ID_EMPRESA
        public string AccountNumber { get; set; }        // NUM_CUENTA
        public string AccountCode { get; set; }       // COD_CUENTA
        public string AccountName { get; set; }       // NOM_CUENTA
        public string CurrencyCode { get; set; }      // COD_MONEDA
        public string Account { get; set; }           // CUENTA
        public string CurrencyName { get; set; }      // MONEDA (Colones or Dolares)
        public string Client { get; set; }            // CLIENTE
        public string DebitCreditFlag { get; set; }   // IND_DEBCRE
        public int LineNumber { get; set; }           // NUM_LINEA
    }

    public class AccountingDetail
    {
        public int CompanyId { get; set; }                // ID_EMPRESA
        public string EntryCode { get; set; }             // COD_ASIENTO
        public DateTime PeriodDate { get; set; }          // FEC_PERIODO
        public int EntryLineNumber { get; set; }          // NUM_LINEA_ASIENTO
        public double TransactionAmount { get; set; }     // MONTO_MOV
        public string AccountNumber { get; set; }         // NUM_CUENTA
        public string DebitCreditIndicator { get; set; }  // IND_DEBCRE
        public double ExchangeRate { get; set; }          // MON_TIPO_CAMBIO
        public double OriginalAmount { get; set; }        // MONTO_ORIGINAL
        public string OriginalCurrency { get; set; }      // MONEDA_ORIGINAL
        public string ClientCode { get; set; }            // COD_CLIENTE
        public string EntryClosureCode { get; set; }      // CIERRE_ASIENTO
    }

    public class CustomsTaxesReportModel
    {
        public string Package { get; set; }
        public string CustomerName { get; set; }
        public string Origin { get; set; }
        public decimal WeightKG { get; set; }
        public string PackageDescription { get; set; }
        public decimal? FOB { get; set; }
        public decimal? CIF { get; set; }
        public string DUA { get; set; }
        public decimal? Amount { get; set; }
        public string AWB { get; set; }
    }

    public class CustomsTaxesReportResponse
    {
        public List<CustomsTaxesReportModel> Items { get; set; }
        public decimal TotalFOB { get; set; }
        public decimal TotalCIF { get; set; }
        public decimal TotalAmount { get; set; }
    }


}