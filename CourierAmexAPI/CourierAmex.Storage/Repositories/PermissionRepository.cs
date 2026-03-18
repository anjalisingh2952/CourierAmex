using Dapper;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public class PermissionRepository : IPermissionRepository
    {
        private readonly IDalSession _session;

        public PermissionRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Permission>> GetAllAsync()
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Permission>("[dbo].[BKO_Permission_GetAll]", null, null, null, System.Data.CommandType.StoredProcedure);
        }
    }
}
