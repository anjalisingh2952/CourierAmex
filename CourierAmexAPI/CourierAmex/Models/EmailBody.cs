namespace CourierAmex.Models
{
	public class EmailBody
	{
		public string? Title { get; set; }
		public string? Subject { get; set; }
		public string? Text { get; set; }
		public bool HasAttachment { get; set; }
		public string? Attachment { get; set; }
		public AttachmentType AttachmentType { get; set; }
		public bool IsHtml { get; set; }
		public EmailQueueStatus Status { get; set; }
	}
}
