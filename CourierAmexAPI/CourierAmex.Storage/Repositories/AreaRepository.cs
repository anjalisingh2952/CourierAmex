using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
    public class AreaRepository : IAreaRepository
    {
        private readonly IDalSession _session;

        public AreaRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Area>> GetByZoneAsync(int zoneId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Area>("[dbo].[BKO_Area_GetByZoneId]", new
            {
                inZoneId = zoneId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Area>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int countryId = 0, int stateId = 0, int zoneId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Area>("[dbo].[BKO_Area_GetPaged]", new
            {
                inCountryId = countryId,
                inStateId = stateId,
                inZoneId = zoneId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Area?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<Area>("[dbo].[BKO_Area_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Area?> CreateOrUpdateAsync(Area entity, Guid userId)
        {
            int? id = entity.Id > 0 ? entity.Id : null;
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_Area_CreateOrUpdate]", new
            {
                inId = id,
                inZoneId = entity.ZoneId,
                inCode = entity.Code,
                inName = entity.Name,
                inNotes = entity.Notes ?? "",
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
