using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
	public class LocationRepository : ILocationRepository
	{
		private readonly IDalSession _session;

		public LocationRepository(IDalSession session)
		{
			_session = session;
		}

		public async Task<IEnumerable<Location>> GetByCompanyAsync(int companyId, int supplierId = 0)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<Location>("[dbo].[BKO_Location_GetByCompany]", new
			{
				inCompanyId = companyId,
				inSupplierId = supplierId
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<Location>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<Location>("[dbo].[BKO_Location_GetPaged]", new
			{
				inCompanyId = companyId,
				inPageSize = pageSize,
				inPageIndex = pageIndex,
				inSortBy = orderBy,
				inFilterBy = filterBy
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<Location?> GetByIdAsync(int id)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryFirstOrDefaultAsync<Location>("[dbo].[BKO_Location_GetById]", new
			{
				inId = id
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<Location?> CreateOrUpdateAsync(Location entity, Guid userId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_Location_CreateOrUpdate]", new
			{
				inId = entity.Id,
				inCompanyId = entity.CompanyId,
				inCountryId = entity.CountryId,
				inName = entity.Name,
				inPhone = entity.Phone ?? "",
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
