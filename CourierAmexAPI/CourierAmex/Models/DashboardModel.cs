namespace CourierAmex.Models
{
    public class DashboardModel
    {
    }

    public class StatusChart
    {
        public string StatusLabel { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class BilledPerMonth
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal TotalFacturado { get; set; }
    }

    public class PaidPerMonth
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal TotalPagado { get; set; }
    }

    public class CashierChart
    {
        public string Cashier { get; set; } = string.Empty;
        public int Count { get; set; }
    }

    public class InvoicesPerMonth
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public int Count { get; set; }
    }

    public class AmountsPerYear
    {
        public int Year { get; set; }
        public string AmountType { get; set; } = string.Empty;
        public decimal Amount { get; set; }
    }

    public class CustomerDetail
    {
        public string DocumentNumber { get; set; } = string.Empty;
        public string DocumentType { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public decimal Total { get; set; }
        public decimal PaidAmount { get; set; }
        public int Status { get; set; }
    }

    public class CustomerDetailsResponse
    {
        public List<CustomerDetail> Data { get; set; } = new List<CustomerDetail>();
        public int TotalRows { get; set; }
    }
}
