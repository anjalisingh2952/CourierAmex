namespace CourierAmex.Models
{
    public class PaymentModel
    {
    }

    public class SignaturePackageResponseModel
    {
        public int PackageNumber { get; set; }
        public byte[] Signature { get; set; }
        public byte[] PackageImage { get; set; }
        public string Customer { get; set; }
        public DateTime LastModifiedDate { get; set; }
        public string ModifiedBy { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
        public string Courier { get; set; }
        public string Name { get; set; }
        public DateTime DeliveryDate { get; set; }
    }

    public class EmailRequest
    {
        public string HtmlTemplate { get; set; }
        public string Email { get; set; }
    }

    public class PointOfSaleModel
    {
        public int CompanyId { get; set; }
        public int PointOfSaleId { get; set; }
        public string PointOfSaleName { get; set; }
        public DateTime CreatedAt { get; set; }
        public int State { get; set; }
        public int OpeningCode { get; set; }
        public string PrinterName { get; set; }
    }

    public class PointOfSaleDailySummaryModel
    {
        public int TotalPayments { get; set; }
        public decimal AmountLocal { get; set; }
        public decimal AmountDollar { get; set; }
        public string Description { get; set; }
    }


    public class SubPaymentTypeModel
    {
        public int CompanyId { get; set; }
        public int SubPaymentId { get; set; }
        public int PaymentId { get; set; }
        public string Description { get; set; }
        public decimal? SalesTex { get; set; }
        public decimal? BankCommission { get; set; }
        public string CurrencyCode { get; set; }
        public string TemplateCode { get; set; }
        public string ModuleCode { get; set; }
        public bool Status { get; set; }
        public DateTime? CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public Guid ModifiedBy { get; set; }
    }

    public class PayTypeModel
    {
        public int PaymentId { get; set; }
        public string Description { get; set; }
        public int CompanyId { get; set; }
        public bool Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public Guid ModifiedBy { get; set; }
    }

    public class PointOfSaleDetailModel
    {
        public int CompanyId { get; set; }
        public int OpeningCode { get; set; }
        public int Id { get; set; }
        public int? PaymentId { get; set; }
        public string UserName { get; set; }
        public int PointOfSaleId { get; set; }
        public int ChangeInDollar { get; set; }
        public int ChangeInLocal { get; set; }
        public DateTime Date { get; set; }
        public string Reference { get; set; }
        public decimal TotalDoller { get; set; }
        public decimal TotalLocal { get; set; }
        public decimal PaidAmount { get; set; }
        public string CurrencyCode { get; set; }
        public string PaymentType { get; set; }
        public string Client { get; set; }
        public string InvoiceIds { get; set; }
        public string SubPaymentDescription { get; set; }
        public string PaymentTypeDescription { get; set; }
    }

    public class ExcelReportResult
    {
        public byte[] FileContent { get; set; }
        public bool Success { get; set; }
        public string ErrorMessage { get; set; }
    }
}
