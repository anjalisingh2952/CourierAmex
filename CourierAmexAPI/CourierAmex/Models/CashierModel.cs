namespace CourierAmex.Models
{
    public class CashierModel : BaseEntityModel<int>
    {
        public string Name { get; set; }
        public string CompanyName { get; set; }
        public string PrinterName { get; set; }
        public string IpAddress { get; set; }
        public int PortNumber { get; set; }
        public new short Status { get; set; }
        public int CompanyId { get; set; }
    }

    public class UserByPointOfSaleModel
    {
        public int CompanyId { get; set; }
        public int PointOfSaleId { get; set; }
        public string User { get; set; }
        public string UserNumber { get; set; }
    }

    public class UserCashier
    {
        public int CompanyId { get; set; }
        public int PointOfSaleId { get; set; }
        public string User { get; set; }
    }
}
