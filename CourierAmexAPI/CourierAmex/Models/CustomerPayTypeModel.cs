namespace CourierAmex.Models
{
    public class CustomerPayTypeModel : BaseEntityModel<int>
    {
        public required int CompanyId { get; set; }
        public required string Name { get; set; }
        public string? CompanyName { get; set; }
    }
}
