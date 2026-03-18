namespace CourierAmex.Models
{
    public class EmailConfiguration
    {
        public string? AppName { get; set; }
        public string? WebUrl { get; set; }
        public string? SmtpServer { get; set; }
        public string? SmtpUserName { get; set; }
        public string? SmtpPassword { get; set; }
        public int? SmtpServerPort { get; set; }
        public bool? EnableSsl { get; set; }
        public bool? IsEnable { get; set; }
        public bool? IsProduction { get; set; }
        public string? EmailDisplayName { get; set; }
        public string? SendersName { get; set; }
        public string? TestEmailAddress { get; set; }
    }
}
