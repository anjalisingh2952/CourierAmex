namespace CourierAmex.Models
{
    public class TemplateModel
    {
        public int CompanyId { get; set; }
        public int Id { get; set; }
        public required string ModuleId { get; set; }
        public int TransactionId { get; set; }
        public int SubTransactionId { get; set; }
        public required string Name { get; set; }
        public required string Status { get; set; }
        public required string ProcessType { get; set; }
        public DateTime? CreatedAt { get; set; }
        public Guid? CreatedBy { get; set; }
        public DateTime? ModifiedAt { get; set; }
        public Guid? ModifiedBy { get; set; }

    }
}
