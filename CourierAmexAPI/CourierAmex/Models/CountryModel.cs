namespace CourierAmex.Models
{
    public class CountryModel : BaseEntityModel<int>
    {
        public required string Name { get; set; }
        public string? Shortname { get; set; }
        public int Code { get; set; }
        public string? Notes { get; set; }
        public string? Address { get; set; }
    }
}
