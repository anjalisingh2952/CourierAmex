namespace CourierAmex.Models
{
    public class PackageStatusModel : BaseEntityModel<int>
    {
        public required string Code { get; set; }
        public required string Name { get; set; }
    }
}
