namespace CourierAmex.Storage.Domain
{
    // TABLE: EST_ESTADO
	public class PackageStatus : BaseEntity<int>
	{
        public required string Code { get; set; }
        public required string Name { get; set; }

        public string? CompanyName { get; set; }
    }
}
