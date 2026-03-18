namespace CourierAmex.Models
{
    public class BulkPackageCategory
    {

        public required int CompanyId { get; set; }
        public required string Category { get; set; }
        public required List<int> Numbers { get; set; }

    }
}
    