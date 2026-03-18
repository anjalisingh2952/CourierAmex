using System.Data.Common;

namespace CourierAmex.Storage
{
    public interface IDalSession : IDisposable
    {
        Task<DbConnection> GetReadOnlyConnectionAsync(CancellationToken cancellationToken = default);
        IUnitOfWork GetUnitOfWork();
    }
}
