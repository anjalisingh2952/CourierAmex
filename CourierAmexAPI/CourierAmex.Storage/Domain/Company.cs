namespace CourierAmex.Storage.Domain
{
    public class Company : BaseEntity<int>
    {
        public required string Name { get; set; }
        public required string Code { get; set; }
        public int CountryId { get; set; }
        public string? Address { get; set; }
        public int MaxLevel { get; set; }
        public int FiscalMonth { get; set; }
        public int CurrencyId { get; set; }
        public bool IsCommodityRequired { get; set;}
        public byte WeightUnit { get; set;}
        public string Phone { get; set; }
        public string Email { get; set; }
        public string? CountryName { get; set; }

        public string AttachmentUrl { get; set; } 
    }


    public class CompanyAttachmentUrl
    {
        public int CompanyId { get; set; }
        public string AttachmentUrl { get; set; }
    }

}
