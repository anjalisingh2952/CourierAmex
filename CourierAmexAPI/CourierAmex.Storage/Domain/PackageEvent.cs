namespace CourierAmex.Storage.Domain
{
    public class PackageEvent
    {
        public int Number { get; set; }
        public DateTime CreatedAt { get; set; }
        public string User { get; set; }
        public string Section { get; set; }
        public string Description { get; set; }
        public string CompanyName { get; set; }
        public int TotalRows { get; set; }
    }
}
