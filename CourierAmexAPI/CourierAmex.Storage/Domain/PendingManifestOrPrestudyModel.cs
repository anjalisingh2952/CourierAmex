using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CourierAmex.Storage.Domain
{
    public class PendingManifestOrPreStudyModel
    {
        public int Package { get; set; }
        public string? Customer { get; set; }
        public string? Name { get; set; }
        public DateTime EntryDate { get; set; }
        public string? Courier { get; set; }
        public string? Description { get; set; }
        public string? Origin { get; set; }
        public int Weight { get; set; }
        public int VolumetricWeight { get; set; }
        public int Price { get; set; }
        public string? Observations { get; set; }
    }
}