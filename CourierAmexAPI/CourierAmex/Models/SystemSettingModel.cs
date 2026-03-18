namespace CourierAmex.Models
{
  public class SystemSettingModel
  {
        public required string Id { get; set; }
        public string? Description { get; set; }
        public required object Value { get; set; }
        public short Type { get; set; }
        public short DisplayOrder { get; set; }
    }

    public class ExchangeRateHistory
    {
        public int CompanyId { get; set; }
        public string CurrencyCode { get; set; }
        public DateTime Date { get; set; }
        public decimal BuyRate { get; set; }
        public decimal SaleRate { get; set; }
        public string CompanyName { get; set; }
    }


}
