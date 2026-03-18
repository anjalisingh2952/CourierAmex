using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CourierAmex.Storage.Domain
{
    public class AverageManifest
    {
        public string ManifestNumber { get; set; }
        public decimal Weight { get; set; }
        public decimal Volume { get; set; }
        public int Quantity { get; set; }
        public decimal TotalBilled { get; set; }
        public decimal TotalCost { get; set; }
        public decimal FreightCost { get; set; }
        public decimal ParafiscalContribution { get; set; }
        public decimal CustomsTax { get; set; }
        public decimal AverageKg { get; set; }
    }

    public class ManifestProvider
    {
        public int SupplierCOD { get; set; }
        public string Supplier { get; set; }
        public string Currency { get; set; }
        public decimal Amount { get; set; }

    }
    public class ManifestProducts
    {
        public int Id { get; set; }
        public string Description { get; set; }

    }

    public class Manifestdetail
    {
        public string FullName { get; set; }
        public string ManifestNumber { get; set; }
        public int InvoiceNumber { get; set; }
        public DateTime Date { get; set; }
        [JsonPropertyName("freightVolume")]
        public int FREIGHT_VOLUMEN { get; set; }
        [JsonPropertyName("internationFreightFlet")]
        public int FREIGHTFLETE_INTERNACIONAL { get; set; }
        [JsonPropertyName("handling")]
        public int HANDLING { get; set; }
        [JsonPropertyName("customsTaxes")]
        public int IMPUESTOS_DE_ADUANA { get; set; }
        [JsonPropertyName("vat")]
        public int IVA { get; set; }
        [JsonPropertyName("crManagement")]
        public int MANEJO_CR { get; set; }
        [JsonPropertyName("packageEvisionPreviousExam")]
        public int PACKAGE_REVISION_PREVIO_EXAMEN { get; set; }
        [JsonPropertyName("packageWithoutInvoice")]
        public int PAQUETE_SIN_FACTURA { get; set; }
        [JsonPropertyName("nonUseAccountCharge")]
        public int RECARGO_NO_USO_DE_CUENTA { get; set; }
        public int Total { get; set; }
    }

    public class ManifestDetailedBiling
    {
        public List<Manifestdetail> Manifestdetails { get; set; }
        public List<ManifestProvider> ManifestSupplier { get; set; }
        public List<AverageManifest> ManifestAverage { get; set; }
    }
}

