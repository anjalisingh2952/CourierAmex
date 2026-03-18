namespace CourierAmex.Models
{
    public class SupplierModel : BaseEntityModel<int>
    {
        public int CompanyId { get; set; }
        public string Name { get; set; }
        public short CountryId { get; set; }
        public string? Address{ get; set; }
        public string? Phone { get; set; }
        public string? Contact { get; set; }
        public List<LocationModel> Locations { get; set; }

        public string? CompanyName { get; set; }
        public string? CountryName { get; set; }
    }
}
