namespace CourierAmex.Storage.Domain
{
	public class EmailQueue
	{
		public Guid Id { get; set; }
		public string? ToAddress { get; set; }
		public string? Subject { get; set; }
		public string? EmailTitle { get; set; }
		public string? EmailBody { get; set; }
		public bool IsHtml { get; set; }
		public bool HasAttachment { get; set; }
		public string? Attachment { get; set; }
		public byte AttachmentType { get; set; }
		public DateTime? CreatedAt { get; set; }
		public DateTime? SendDate { get; set; }
		public string? Error { get; set; }
		public byte Status { get; set; }
	}
}
