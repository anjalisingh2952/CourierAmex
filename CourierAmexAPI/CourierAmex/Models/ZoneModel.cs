namespace CourierAmex.Models
{
    public class ZoneModel : BaseEntityModel<int>
    {
        public required int CountryId { get; set; }
        public required int StateId { get; set; }
        public required string Code { get; set; }
        public required string Name { get; set; }
        public string? Notes { get; set; }
        public int Route { get; set; }

        public string? CountryName { get; set; }
        public string? StateName { get; set; }
    }
}
