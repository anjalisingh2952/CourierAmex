namespace CourierAmex.Models
{
    public class StateModel : BaseEntityModel<int>
    { 
        public required string Name { get; set; }
        public int CountryId { get; set; }

        public string? CountryName { get; set; }
    }
}
