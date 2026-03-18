using CourierAmex.Storage.Domain;
using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IEmailQueueService
    {
        Task CreateAsync(string toAddress, EmailBody body);
        Task<IEnumerable<EmailQueue>> GetByStatusAsync(byte status);
        Task MarkEmailAsSendAsync(EmailQueue request);
        Task MarkEmailAsErrorAsync(EmailQueue request);
        Task<EmailConfiguration> LoadSettings();
        Task SendEmailAsync(string toAddress, EmailBody? body = null);
    }
}
