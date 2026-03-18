using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
    public class CountryRepository : ICountryRepository
    {
        private readonly IDalSession _session;

        public CountryRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Country>> GetAllAsync()
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Country>("[dbo].[BKO_Country_GetAll]", null, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Country>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "")
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Country>("[dbo].[BKO_Country_GetPaged]", new
            {
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Country?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<Country>("[dbo].[BKO_Country_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Country?> CreateOrUpdateAsync(Country entity, Guid userId)
        {
            int? id = entity.Id > 0 ? entity.Id : null;
            int? code = entity.Code > 0 ? entity.Code : null;

            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_Country_CreateOrUpdate]", new
            {
                inId = id,
                inName = entity.Name,
                inShortName = entity.Shortname ?? "",
                inCode = code,
                inNotes = entity.Notes ?? "",
                inAddress = entity.Address ?? "",
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
