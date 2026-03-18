using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
    public class StateRepository : IStateRepository
    {
        private readonly IDalSession _session;

        public StateRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<State>> GetByCountryAsync(int countryId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<State>("[dbo].[BKO_State_GetByCountryId]", new
            {
                inCountryId = countryId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<State>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int countryId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<State>("[dbo].[BKO_State_GetPaged]", new
            {
                inCountryId = countryId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<State?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<State>("[dbo].[BKO_State_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<State?> CreateOrUpdateAsync(State entity, Guid userId)
        {
            int? id = entity.Id > 0 ? entity.Id : null;
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_State_CreateOrUpdate]", new
            {
                inId = id,
                inCountryId = entity.CountryId,
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
