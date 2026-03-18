using System.Security.Cryptography.X509Certificates;

namespace CourierAmex.Models
{
    public class PackageLogNotesModel: BaseEntityModel<int>
    {
        public int IdNota { get; set; }
        public int? Number { get; set; }
        public string? Codigo { get; set; }
        public string? Courier { get; set; }
        public string? Message { get; set; }
        public string? User { get; set; }
        public string? LogType { get; set; }
        public DateTime? CreatedAt { get; set; }
        public string? CompanyName { get; set; }
        public string? CustomerName { get; set; }
    }
}
