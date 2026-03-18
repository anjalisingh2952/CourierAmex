namespace CourierAmex.Storage.Domain
{
  public class SystemSetting
  {
        public required string Id { get; set; }
        public required string Value { get; set; }
        public short Type { get; set; }
        public short DisplayOrder { get; set; }
        public string? Description { get; set; }
    }

    public class ExchangeRateModel
    {
        public int CompanyId { get; set; }

        public string SourceCurrencyCode { get; set; } = string.Empty;

        public string DestinationCurrency { get; set; } = string.Empty;

        public float SaleRate { get; set; }

        public float PurchaseRate { get; set; }

        public DateTime Date { get; set; }
    }

 
   

}
