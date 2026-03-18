using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
    public class PackageStatusRepository : IPackageStatusRepository
    {
        private readonly IDalSession _session;

        public PackageStatusRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<PackageStatus>> GetActiveAsync()
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PackageStatus>("[dbo].[BKO_PackageStatus_GetActive]", null, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PackageStatus>> ValidateCodeAsync(int id, string code)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PackageStatus>("[dbo].[BKO_PackageStatus_ValidateCode]", new {
                inId = id,
                inCode = code
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PackageStatus>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "")
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PackageStatus>("[dbo].[BKO_PackageStatus_GetPaged]", new
            {
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<PackageStatus?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            using var multi = await connection.QueryMultipleAsync("[dbo].[BKO_PackageStatus_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);

            var entity = await multi.ReadSingleOrDefaultAsync<PackageStatus>();
            return entity;
        }

        public async Task<PackageStatus?> CreateOrUpdateAsync(PackageStatus entity, Guid userId)
        {
            int? id = entity.Id > 0 ? entity.Id : null;
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_PackageStatus_CreateOrUpdate]", new
            {
                inId = id,
                inCode = entity.Code,
                inName = entity.Name,
                inStatus = (byte)entity.Status,
                inUserId = userId
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (int.TryParse(newId.ToString(), out int idOutput) && entity.Status != BaseEntityStatus.Deleted)
            {
                entity.Id = idOutput;
            }

            return entity;
        }
    }
}
