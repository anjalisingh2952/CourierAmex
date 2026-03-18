namespace CourierAmex.Models
{
    public class PackageEventModel
    {
        public int Number { get; set; }
        public long CreatedAt { get; set; }
        public string User { get; set; }
        public string Section { get; set; }
        public string Description { get; set; }
        public string CompanyName { get; set; }
    }
}
