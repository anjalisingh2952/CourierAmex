using Dapper;

using CourierAmex.Storage.Domain;


namespace CourierAmex.Storage.Repositories
{
	public class EmailQueueRepository : IEmailQueueRepository
	{
		private readonly IDalSession _session;

		public EmailQueueRepository(IDalSession session)
		{
			_session = session;
		}

		public async Task CreateAsync(EmailQueue request)
		{
			var uom = _session.GetUnitOfWork();
			var connection = await uom.GetConnectionAsync();

			await connection.ExecuteAsync("[dbo].[BKO_EmailQueue_Create]", new
			{
				inToAddress = request.ToAddress,
				inSubject = request.Subject,
				inEmailTitle = request.EmailTitle,
				inEmailBody = request.EmailBody,
				inIsHtml = request.IsHtml,
				inHasAttachment = request.HasAttachment,
				inAttachment = request.Attachment,
				inAttachmentType = request.AttachmentType,
				inStatus = request.Status
			}, uom.GetTransaction(), null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<EmailQueue>> GetByStatusAsync(byte status)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<EmailQueue>("[dbo].[BKO_EmailQueue_GetByStatus]", new
			{
				inStatus = status
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task MarkEmailAsErrorAsync(EmailQueue request)
		{
			var uom = _session.GetUnitOfWork();
			var connection = await uom.GetConnectionAsync();

			await connection.ExecuteAsync("[dbo].[BKO_EmailQueue_Update]", new
			{
				inId = request.Id,
				inError = request.Error,
				inStatus = request.Status
			}, uom.GetTransaction(), null, System.Data.CommandType.StoredProcedure);
		}

		public async Task MarkEmailAsSentAsync(EmailQueue request)
		{
			var uom = _session.GetUnitOfWork();
			var connection = await uom.GetConnectionAsync();

			await connection.ExecuteAsync("[dbo].[BKO_EmailQueue_Update]", new
			{
				inId = request.Id,
				inError = "",
				inStatus = request.Status
			}, uom.GetTransaction(), null, System.Data.CommandType.StoredProcedure);
		}
	}
}
