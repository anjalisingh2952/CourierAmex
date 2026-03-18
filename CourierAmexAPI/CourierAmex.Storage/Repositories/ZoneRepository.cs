using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
    public class ZoneRepository : IZoneRepository
    {
        private readonly IDalSession _session;

        public ZoneRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Zone>> GetByStateAsync(int stateId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Zone>("[dbo].[BKO_Zone_GetByStateId]", new
            {
                inStateId = stateId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Zone>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int countryId = 0, int stateId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Zone>("[dbo].[BKO_Zone_GetPaged]", new
            {
                inCountryId = countryId,
                inStateId = stateId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Zone?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<Zone>("[dbo].[BKO_Zone_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Zone?> CreateOrUpdateAsync(Zone entity, Guid userId)
        {
            int? id = entity.Id > 0 ? entity.Id : null;
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_Zone_CreateOrUpdate]", new
            {
                inId = id,
                inCountryId = entity.CountryId,
                inStateId = entity.StateId,
                inCode = entity.Code,
                inName = entity.Name,
                inNotes = entity.Notes ?? "",
                inRoute = entity.Route,
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
