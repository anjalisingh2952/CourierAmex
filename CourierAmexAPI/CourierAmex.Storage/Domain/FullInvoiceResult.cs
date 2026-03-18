using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
namespace CourierAmex.Storage.Domain
{
    public class FullInvoiceResult
    {
        public Invoice Invoice { get; set; }
        public List<Invoice> Details { get; set; }
        public Company Company { get; set; }
        public List<Package> Packages { get; set; }
        public float Balance { get; set; }
    }
}