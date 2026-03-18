using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
    public class ClientCategoryRepository : IClientCategoryRepository
    {
        private readonly IDalSession _session;

        public ClientCategoryRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<ClientCategory>> GetByCompanyAsync(int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<ClientCategory>("[dbo].[BKO_ClientCategory_GetByCompany]", new
            {
                inCompanyId = companyId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ClientCategory>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<ClientCategory>("[dbo].[BKO_ClientCategory_GetPaged]", new
            {
                inCompanyId = companyId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<ClientCategory?> GetByIdAsync(byte id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            using var multi = await connection.QueryMultipleAsync("[dbo].[BKO_ClientCategory_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);

            var entity = await multi.ReadSingleOrDefaultAsync<ClientCategory>();
            if (entity != null)
                entity.ExcludedProducts = (await multi.ReadAsync<Product>()).ToList();
            if (entity != null)
                entity.IncludedProducts = (await multi.ReadAsync<Product>()).ToList();

            return entity;
        }

        public async Task<ClientCategory?> CreateOrUpdateAsync(ClientCategory entity, Guid userId)
        {
            var excludedProducts = entity.ExcludedProducts != null && entity.ExcludedProducts.Any() ? string.Join(",", entity.ExcludedProducts.Select(x => x.Id)) : "";
            var includedProducts = entity.IncludedProducts != null && entity.IncludedProducts.Any() ? string.Join(",", entity.IncludedProducts.Select(x => x.Id)) : "";

            byte? id = entity.Id > 0 ? entity.Id : null;
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<byte>("[dbo].[BKO_ClientCategory_CreateOrUpdate]", new
            {
                inId = id,
                inCompanyId = entity.CompanyId,
                inName = entity.Name,
                inDiscount = entity.Discount,
                inExcludedProducts = excludedProducts,
                inIncludedProducts = includedProducts,
                inStatus = (byte)entity.Status,
                inUserId = userId
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (byte.TryParse(newId.ToString(), out byte idOutput) && entity.Status != BaseEntityStatus.Deleted)
            {
                entity.Id = idOutput;
            }

            return entity;
        }
    }
}
