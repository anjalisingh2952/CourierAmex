namespace CourierAmex.Storage.Domain
{
    public class Area : BaseEntity<int>
    {
        public required int ZoneId { get; set; }
        public required string Code{ get; set; }
        public required string Name { get; set; }
        public string? Notes { get; set; }

        public string? ZoneName { get; set; }
        public int? StateId { get; set; }
        public int? CountryId { get; set; }
    }
}
