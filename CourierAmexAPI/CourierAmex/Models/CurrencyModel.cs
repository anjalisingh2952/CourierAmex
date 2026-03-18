namespace CourierAmex.Models
{
    public class CurrencyModel: BaseEntityModel<int>
    {
        public required int CompanyId { get; set; }
        // CODE
        public required string Name { get; set; }
        // DESCRIPTION
        public decimal BuyingRate { get; set; }
        
        public decimal SellingRate { get; set; }

        public DateTime EXRDate { get; set; }

    }
}
