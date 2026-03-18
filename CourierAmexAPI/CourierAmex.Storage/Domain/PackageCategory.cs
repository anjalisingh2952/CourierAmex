namespace CourierAmex.Storage.Domain
{
    public class PackageCategory
    {   
        public required int CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public required int Number { get; set; }
        public required string CustomerCode { get; set; }
        public string? CustomerName { get; set; }
        public required string Description { get; set; }
        public required string Category { get; set; }

        public bool? select { get; set; }
    }

    public class ClassifyPackage
    {
        public int Id { get; set; }
        public short ShipTypeId { get; set; }
        public short IssueTypeId { get; set; }
        public short ManifestId { get; set; }
    }

    public class PackagePrice
    {
        public required int PackageNumber { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public bool IsPermission { get; set; }
        public bool IsDocument { get; set; }
    }
}
