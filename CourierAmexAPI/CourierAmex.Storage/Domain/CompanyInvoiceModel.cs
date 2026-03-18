namespace CourierAmex.Storage.Domain
{

    public class CustomerInfo
    {
        public int Filter { get; set; } = 0;
        public string Customer { get; set; }
        public string FullName { get; set; }
        public string Address { get; set; }
        public string Commission { get; set; }
        public string Delivery { get; set; }
        public int PaymentTypeId { get; set; }
        public int AreaId { get; set; }
        public string Area { get; set; }
        public int ZoneId { get; set; }
        public string Zone { get; set; }
    }

    public class PackageInfo
    {
        public int Filter { get; set; } = 0;
        public int Id { get; set; }
        public string PackageNumber { get; set; }
        public string Customer { get; set; }
        public string Courier { get; set; }
        public string CourierNumber { get; set; }
        public string Origin { get; set; }
        public string Observation { get; set; }
        public string Sure { get; set; }
        public string Country { get; set; }
        public DateTime FechaCreo { get; set; }
        public DateTime? ModificationDate { get; set; }
        public string Creo { get; set; }
        public string ModifiedBy { get; set; }
        public int PackagesCount { get; set; }
        public int ManifestId { get; set; }
        public string Description { get; set; }
        public decimal Weight { get; set; }
        public decimal Price { get; set; }
        public decimal Broad { get; set; }
        public decimal High { get; set; }
        public decimal Long { get; set; }
        public decimal VolumeWeight { get; set; }
        public string RecievedBy { get; set; }
        public int Des_Id { get; set; }
        public string PackageType { get; set; }
        public string COD { get; set; }
        public bool Invoiced { get; set; }
        public int Pallets { get; set; }
        public int Bag { get; set; }
        public decimal TotalWeight { get; set; }
        public string Guy { get; set; }
        public string TotalLabel { get; set; }
        public string PackagingDetails { get; set; }
        public string CustomerLooker { get; set; }
        public string TaxType { get; set; }
        public string CourierType { get; set; }
        public string PackageSubType { get; set; }
        public string ManifestNumber { get; set; }
    }

    public class CompanyInvoiceData
    {
        public List<CustomerInfo> CustomerInfo { get; set; }
        public List<PackageInfo> PackageInfo { get; set; }
        public PackageInvoiceSummary PackageSummary { get; set; }
    }

    public class PackageInvoiceSummary
    {
        public int Total { get; set; }
        public int Pending { get; set; }
        public int Billed { get; set; }
    }

    public class ComapnyInvoiceHeader
    {
        public int CompanyId { get; set; }
        public string User { get; set; }
        public string Customer { get; set; }
        public DateTime Date { get; set; }
        public double TaxAmount { get; set; }
        public double ExemptAmount { get; set; }
        public double CustomsTax { get; set; }
        public double SalesTax { get; set; }
        public double SubTotal { get; set; }
        public double Discount { get; set; }
        public double Total { get; set; }
        public double TotalLocal { get; set; }
        public string Note { get; set; }
    }

    public class CompanyInvoiceDetail
    {
        public int CompanyId { get; set; }
        public int InvoiceNumber { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public float Price { get; set; }
        public float CustomsTax { get; set; }
        public float SalesTax { get; set; }
        public float TaxableAmount { get; set; }
        public float ExemptAmount { get; set; }
        public float Subtotal { get; set; }
        public float Discount { get; set; }
        public float Total { get; set; }
    }

    public class InvoiceCreditPending
    {
        public string CustomerCode { get; set; }
        public string FullName { get; set; }
        public string PaymentType { get; set; }
        public string Zone { get; set; }
        public string InvoiceNumber { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string InvoiceStatus { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal TotalLocalAmount { get; set; }
        public decimal Balance { get; set; }
        public decimal LocalBalance { get; set; }
        public string Stop { get; set; }
    }

    public class InvoiceArticle
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public bool Exempt { get; set; }
        public int Quantity { get; set; }
        public decimal CustomsTax { get; set; }
        public decimal FixedAmount { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }
        public decimal Tax { get; set; }
        public decimal Discount { get; set; }
    }

    public class UpdateInvoiceStatusRequest
    {
        public string Packages { get; set; }
    }

    public class ElectronicInvoice
    {
        public string FullName { get; set; }
        public string DocumentNumber { get; set; }
        public int DocumentType { get; set; }
        public string Email { get; set; }
        public string DocumentTypeCode { get; set; }
    }

    public class InsertElectronicInvoice
    {
        public DateTime Date { get; set; }
        public int InvoiceNumber { get; set; }
        public int CompanyId { get; set; }
        public int PaymentType { get; set; }
        public string TaxDetailLineCode { get; set; }
        public string SaleCondition { get; set; }
    }

    public class InsertMiamiInvoice
    {
        public int CompanyId { get; set; }
        public int PackageNumber { get; set; }
        public string User { get; set; }
        public string ReferenceNumber { get; set; }
        public decimal Total { get; set; }
    }

    public class ManifestInvoice
    {
        public int ManifestNumber { get; set; }
    }

    public class CompanyExchangeRate
    {
        public int CompanyId { get; set; }
        public string Company { get; set; }
        public float SaleExchangeRate { get; set; }
    }

    public class SalesSummaryReport
    {
        public string InvoiceNumber { get; set; }                // fe.NumeroConsecutivo
        public DateTime IssueDate { get; set; }                  // fe.FechaEmision
        public string InvoiceType { get; set; }                  // TipoComprobante (based on case logic)
        public string RecipientName { get; set; }                // fe.ReceptorNombre
        public string CurrencyCode { get; set; }                 // fe.ResumenFacturaCodigoTipoMonedaCodigoMoneda
        public decimal TotalAmount { get; set; }                 // fe.ResumenFacturaTotalComprobante
        public decimal TotalExemptAmount { get; set; }           // fe.ResumenFacturaTotalExento
        public decimal TotalTaxableAmount { get; set; }          // fe.ResumenFacturaTotalGravado
        public decimal TotalTaxAmount { get; set; }              // fe.ResumenFacturaTotalImpuesto
        public decimal TotalExemptGoodsAmount { get; set; }      // fe.ResumenFacturaTotalMercanciasExentas
        public decimal TotalSaleAmount { get; set; }             // fe.ResumenFacturaTotalVenta
        public string ResponseStatus { get; set; }               // fe.Respuesta
        public string PaymentMethod { get; set; }                // MedioPago (based on case logic)
        public string SaleCondition { get; set; }                // 'Contado'
        public string ClientCode { get; set; }                   // ff.CLIENTE
        public string AdditionalChargesDetail { get; set; }      // fe.OtrosCargosDetalle
        public decimal? AdditionalChargesAmount { get; set; }    // fe.OtrosCargosMontoCargo
        public string StartDate { get; set; }                    // @STARTDATE (formatted as string)
        public string EndDate { get; set; }                      // @ENDDATE (formatted as string)
    }


}
