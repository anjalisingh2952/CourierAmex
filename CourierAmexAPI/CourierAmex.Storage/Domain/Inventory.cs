
namespace CourierAmex.Storage.Domain
{
    public class StoreInventoryPackage
    {
        public string StoreName { get; set; }
        public string User { get; set; }
        public int PackageNumber { get; set; }
        public string CustomerAccount { get; set; }
        public string CustomerName { get; set; }
        public DateTime Date { get; set; }

    }

    public class InventoryPackage
    {
        public int StoreId { get; set; }
        public int PackageNumber { get; set; }
        public string UserName { get; set; }
        public DateTime Date { get; set; }
    }

    public class StoreInventory
    {
        public string Customer { get; set; }
        public string Store { get; set; }
        public string Name { get; set; }
        public string Package { get; set; }
        public string PackageStatus { get; set; }
        public string Invoice { get; set; }
        public string InvoiceStatus { get; set; }
        public string PaymentType { get; set; }
        public string Zone { get; set; }
        public string Stop { get; set; }
        public DateTime CreatedDate { get; set; }
        public string Transport { get; set; }
        public string TransportType { get; set; }
        public string DeliveryType { get; set; }
        public string Difference { get; set; }
        public string Route { get; set; }
    }
}
