namespace CourierAmex.Storage.Domain
{
    public class Cashier : BaseEntity<int>
    {
        public string Name { get; set; }
        public string CompanyName { get; set; }
        public string PrinterName { get; set; }
        public string IpAddress { get; set; }
        public int PortNumber { get; set; }
        public new short Status { get; set; }
        public int CompanyId { get; set; }

    }

    public class UserByPointOfSale
    {
        public int CompanyId { get; set; }
        public int PointOfSaleId { get; set; }
        public string User { get; set; }
        public string UserNumber { get; set; }
    }

}
