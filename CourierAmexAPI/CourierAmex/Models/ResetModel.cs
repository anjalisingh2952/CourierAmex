namespace CourierAmex.Models
{
    public class ResetRequest
    {
        public required string UserId { get; set; }
        public required string Password { get; set; }
    }
}
