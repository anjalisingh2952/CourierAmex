
namespace CourierAmex.Storage.Domain
{
    public class Currency:BaseEntity<int>
    {
        public required int CompanyId { get; set; }
        // CODE
        public required string Name { get; set; }
        // DESCRIPTION
        public decimal BuyingRate { get; set; }

        public decimal SellingRate { get; set; }

        public DateTime EXRDate { get; set; }

    }

    public class ExchangeRateHistoryResponse
    {
        public int CompanyId { get; set; }
        public string CurrencyCode { get; set; }
        public DateTime Date { get; set; }
        public decimal BuyRate { get; set; }
        public decimal SaleRate { get; set; }
        public string CompanyName { get; set; }
    }
}
