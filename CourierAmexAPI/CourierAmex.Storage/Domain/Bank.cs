
namespace CourierAmex.Storage.Domain
{
    public class Bank : BaseEntity<int>
    {
        public required int CompanyId { get; set; }
        public required string Name { get; set; }
        public string? Phone { get; set; }
        public string? Address { get; set; }

    }
}
