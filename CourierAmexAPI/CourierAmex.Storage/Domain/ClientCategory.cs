namespace CourierAmex.Storage.Domain
{
	public class ClientCategory : BaseEntity<byte>
	{
        public required int CompanyId { get; set; }
        public required string Name { get; set; }
        public int Discount { get; set; }

        public IEnumerable<Product>? ExcludedProducts { get; set; }
        public IEnumerable<Product>? IncludedProducts { get; set; }

        public string? CompanyName { get; set; }
    }
}
