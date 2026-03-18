namespace CourierAmex.Storage.Domain
{
	// TABLE: FC_COMODITYS
	public class Commodity : BaseEntity<int>
	{
		// CompanyId
		public required int CompanyId { get; set; }
		// CODE
		public required string Code { get; set; }
		// DESCRIPTION
		public required string Description { get; set; }
		// CUSTOMS_DUTY
		public decimal CustomsDuty { get; set; }
		// CUSTOMS_GCT
		public decimal CustomsGct { get; set; }
		// CUSTOMS_FEE
		public decimal CustomsFee { get; set; }

		public string? CompanyName { get; set; }
	}
}