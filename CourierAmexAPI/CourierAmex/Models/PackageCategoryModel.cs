namespace CourierAmex.Models
{
    public class PackageCategoryModel : BaseEntityModel<int>
    {
        public required int CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public required int Number { get; set; }
        public required string CustomerCode { get; set; }
        public string? CustomerName { get; set; }
        public required string Description { get; set; }
        public required string Category { get; set; }
        
        public bool? select { get; set; }
        public decimal? Price { get; set; }
        public decimal Weight { get; set; }
        public required string Origin { get; set; }
        public decimal VolumetricWeight { get; set; }
        public required string TrackingNumber { get; set; }
    }
}
