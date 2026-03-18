namespace CourierAmex.Storage.Domain
{
    public class CustomerPayType : BaseEntity<int>
    {
        public required int CompanyId { get; set; }
        public required string Name { get; set; }
        public string? CompanyName { get; set; }
    }
}
