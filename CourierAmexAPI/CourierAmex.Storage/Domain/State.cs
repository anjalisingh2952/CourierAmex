namespace CourierAmex.Storage.Domain
{
    public class State : BaseEntity<int>
    {
        public required int CountryId { get; set; }
        public required string Name { get; set; }

        public string? CountryName { get; set; }
    }
}
