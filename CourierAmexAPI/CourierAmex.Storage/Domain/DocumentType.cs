namespace CourierAmex.Storage.Domain
{
    // TABLA: TIPODOCUMENTO
    public class DocumentType : BaseEntity<int>
    {
        public required string Name { get; set; }
        public required int CompanyId { get; set; }
        public string? Mask{ get; set; }
        public string? CompanyName { get; set; }
    }
}
