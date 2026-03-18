namespace CourierAmex.Storage.Domain
{
    public class Product : BaseEntity<int>
    {
        public required int CompanyId { get; set; }
        public required string Name { get; set; }
        public required decimal BasePrice { get; set; }
        public int Type { get; set; }
        public bool PriceRange { get; set; }
        public bool Exempt { get; set; }
        public bool CustomsTax { get; set; }
        public bool FixedAmount { get; set; }
        public int Amount { get; set; }
        public bool OnePoint { get; set; }
        public bool TwoPoint { get; set; }
        public bool Documents { get; set; }
        public bool Exterior { get; set; }
        public bool OtherChanges { get; set; }
        public string? DocumentTypeCharges { get; set; }
        public string? OtherChangesIdThree { get; set; }
        public string? OtherChangesNameThree { get; set; }
        public string? OtherChangesTypeIdThree { get; set; }
        public decimal UnitPrice { get; set; }
        public bool Air { get; set; }
        public bool Sea { get; set; }
        public bool AdditionalChargesPackage { get; set; }
        public required string GoodServiceCode { get; set; }

        public string? GoodServiceName { get; set; }
        public int Tax { get; set; }
    }
}
