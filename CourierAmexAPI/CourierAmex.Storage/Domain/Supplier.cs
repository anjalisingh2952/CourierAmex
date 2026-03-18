namespace CourierAmex.Storage.Domain
{
    public class Supplier : BaseEntity<int>
    {
        public required int CompanyId { get; set; }
        public required string Name { get; set; }
        public required int CountryId { get; set; }
        public string? Address{ get; set; }
        public string? Phone { get; set; }
        public string? Contact { get; set; }
        public string? CompanyName { get; set; }
        public string? CountryName { get; set; }
        public IEnumerable<Location>? Locations { get; set; }
    }

    public class PurchaseReport
    {
        public string EntryCode { get; set; }
        public string SupplierCode { get; set; }
        public string SupplierName { get; set; }
        public string PaymentNote { get; set; }
        public string EntryDetail { get; set; }
        public DateTime EntryDate { get; set; }
        public DateTime PaymentDate { get; set; }
        public string Reference { get; set; }
        public string Description { get; set; }
        public decimal SubtotalAmount { get; set; }
        public decimal ExemptAmount { get; set; }
        public decimal TaxedAmount { get; set; }
        public decimal TotalAmount { get; set; }
        public decimal ParaFiscalContribution { get; set; }
        public decimal VATPercentage { get; set; }
        public string ReportStartDate { get; set; }
        public string ReportEndDate { get; set; }
    }


}
