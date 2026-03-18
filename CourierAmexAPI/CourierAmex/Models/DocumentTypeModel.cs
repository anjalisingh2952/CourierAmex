namespace CourierAmex.Models
{
    public class DocumentTypeModel : BaseEntityModel<int>
    {
        public required string Name { get; set; }
        public required int CompanyId { get; set; }
        public string? Mask{ get; set; }
        public string? CompanyName { get; set; }
    }
}
