namespace CourierAmex.Storage.Domain
{
    public class Location : BaseEntity<int>
    {
        public required int CompanyId { get; set; }
        public required string Name { get; set; }
        public required int CountryId { get; set; }
        public string? Phone { get; set; }

        public string? CompanyName { get; set; }
        public string? CountryName { get; set; }
        public bool IsSelected { get; set; }
    }
}
