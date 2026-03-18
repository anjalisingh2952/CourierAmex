namespace CourierAmex.Models
{
    public class LocationModel : BaseEntityModel<int>
    {
        public required int CompanyId { get; set; }
        public required string Name { get; set; }
        public required short CountryId { get; set; }
        public string? Phone { get; set; }

        public string? CompanyName { get; set; }
        public string? CountryName { get; set; }
        public bool IsSelected { get; set; }
    }
}
