using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
	public class ShippingWayTypeRepository : IShippingWayTypeRepository
	{
		private readonly IDalSession _session;

		public ShippingWayTypeRepository(IDalSession session)
		{
			_session = session;
		}

		public async Task<IEnumerable<ShippingWayType>> GetAllActiveAsync(int shipType)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<ShippingWayType>("[dbo].[BKO_ShippingWayType_GetByShipType]", new
			{
				inShipType = shipType
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<ShippingWayType>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "")
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<ShippingWayType>("[dbo].[BKO_ShippingWayType_GetPaged]", new
			{
				inPageSize = pageSize,
				inPageIndex = pageIndex,
				inSortBy = orderBy,
				inFilterBy = filterBy
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<ShippingWayType?> GetByIdAsync(int id)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryFirstOrDefaultAsync<ShippingWayType>("[dbo].[BKO_ShippingWayType_GetById]", new
			{
				inId = id
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<ShippingWayType?> CreateOrUpdateAsync(ShippingWayType entity, Guid userId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_ShippingWayType_CreateOrUpdate]", new
			{
				inId = entity.Id,
				inShipType = entity.ShipType,
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
