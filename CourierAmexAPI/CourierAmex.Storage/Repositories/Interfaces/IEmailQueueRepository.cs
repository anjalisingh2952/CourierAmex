using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
	public interface IEmailQueueRepository
	{
		Task<IEnumerable<EmailQueue>> GetByStatusAsync(byte status);
		Task CreateAsync(EmailQueue request);
		Task MarkEmailAsSentAsync(EmailQueue request);
		Task MarkEmailAsErrorAsync(EmailQueue request);
	}
}
