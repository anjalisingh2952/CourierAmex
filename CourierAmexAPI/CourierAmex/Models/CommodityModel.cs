namespace CourierAmex.Models
{
    public class CommodityModel : BaseEntityModel<int>
    {
        public required int CompanyId { get; set; }
		public required string Code { get; set; }
		public required string Description { get; set; }
		public decimal CustomsDuty { get; set; }
		public decimal CustomsGct { get; set; }
		public decimal CustomsFee { get; set; }

		public string? CompanyName { get; set; }
    }
}
