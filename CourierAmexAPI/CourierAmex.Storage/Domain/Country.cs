namespace CourierAmex.Storage.Domain
{
    public class Country : BaseEntity<int>
    {
        public required string Name { get; set; }
        public string? Shortname { get; set; }
        public int Code { get; set; }
        public string? Notes { get; set; }
        public string? Address { get; set; }
    }
}
