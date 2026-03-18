using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CourierAmex.Storage.Domain
{
    public class ScanLog : BaseEntity<long>
    {
        public string User { get; set; }
        public string LogType { get; set; }
        public string ScanType { get; set; }
        public int PackageNumber { get; set; }
        public string PreviousManifest { get; set; }
        public string NewManifest { get; set; }
        public string PreviousBag { get; set; }
        public string NewBag { get; set; }
    }
}
