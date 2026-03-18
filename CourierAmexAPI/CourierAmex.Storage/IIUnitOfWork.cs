using System.Data;
using System.Data.Common;

namespace CourierAmex.Storage
{
	public interface IUnitOfWork : IDisposable
	{
		Task<DbConnection> GetConnectionAsync(bool transactional = false, IsolationLevel isolationLevel = IsolationLevel.ReadCommitted, CancellationToken cancellationToken = default);
		DbTransaction? GetTransaction();
		void CommitChanges();
	}
}
