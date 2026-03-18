namespace CourierAmex.Models
{
    public class PackageNotesModel: BaseEntityModel<int>
    {
        public string? Codigo { get; set; }
        public string? Courier { get; set; }
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime DueDate { get; set; }
        public string? IdUser { get; set; }
        public bool Sincronized { get; set; } = false;
        public string? CompanyName { get; set; } = null;
        public string? NombreCompleto { get; set; } = null;
        public string? Compannia { get; set; } = null;
        public int CompanyId { get; set; }
    }
}
