using System.Globalization;

namespace CourierAmex.Models
{
    public class InvoiceModel : BaseEntityModel<int>
    {
        public string InvoiceNumber { get; set; } // FACTURA
        public string User { get; set; } // USUARIO
        public int CashRegisterID { get; set; } // CAJA_ID
        public string Client { get; set; } // CLIENTE
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
    }

    public class InvoiceDetailsModel : BaseEntityModel<int>
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

    public class PaymentInfoModel : BaseEntityModel<int>
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

    public class PendingInvoiceReportModel
    {
        public string CustomerCode { get; set; }           // C.CODIGO
        public string CustomerFullName { get; set; }       // C.NOMBRECOMPLETO
        public string PaymentType { get; set; }            // TP.DESCRIPCION
        public string Zone { get; set; }                   // Z.NOMBRE
        public string InvoiceNumber { get; set; }          // F.N_FACTURA
        public DateTime InvoiceDate { get; set; }          // F.FECHA
        public string InvoiceStatus { get; set; }          // EF.DESCRIPCION
        public decimal Total { get; set; }                 // F.TOTAL
        public decimal TotalLocal { get; set; }            // F.TOTALLOCAL
        public decimal Balance { get; set; }               // F.SALDO
        public decimal LocalBalance { get; set; }          // F.SALDOLOCAL
        public string Stop { get; set; }
        public string FormattedTotal => Total.ToString("N2", new System.Globalization.CultureInfo("en-US"));
        public string FormattedTotalLocal => TotalLocal.ToString("N2", new System.Globalization.CultureInfo("en-US"));
        public string FormattedBalance => Balance.ToString("N2", new System.Globalization.CultureInfo("en-US"));
        public string FormattedLocalBalance => LocalBalance.ToString("N2", new System.Globalization.CultureInfo("en-US"));
    }


    public class SalesReportModel
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


    public class CreditNoteInsertRequestModel
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

    public class TemplateAccountModel
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





}