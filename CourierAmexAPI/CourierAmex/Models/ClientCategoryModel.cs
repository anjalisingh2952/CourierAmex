namespace CourierAmex.Models
{
    public class ClientCategoryModel : BaseEntityModel<byte>
    {
        public required int CompanyId { get; set; }
        public required string Name { get; set; }
        public int Discount { get; set; }
        public IEnumerable<ProductModel>? ExcludedProducts { get; set; }
        public IEnumerable<ProductModel>? IncludedProducts { get; set; }

        public string? CompanyName { get; set; }
    }
}
