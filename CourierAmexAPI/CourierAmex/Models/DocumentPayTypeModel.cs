namespace CourierAmex.Models
{ 
    public class DocumentPayTypeModel : BaseEntityModel<int>
    {
        public required string Name { get; set; }
        public required int PayTypeId { get; set; }
        public string? PayType { get; set; }
        public int CurrencyCode { get; set; }
        public string? Currency { get; set; }
        public int? BankId { get; set; }

        public int? BrandId { get; set; }

        public decimal BankComission { get; set; }

        public decimal VATWithholding { get; set; }

        public decimal IncomeWithholding { get; set; }

        public string? ModuleId { get; set; }

        public int TemplateId { get; set; }

        public required int CompanyId { get; set; }
        public string? CompanyName { get; set; }
    }
}

