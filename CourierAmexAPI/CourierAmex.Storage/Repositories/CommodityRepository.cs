using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
	public class CommodityRepository : ICommodityRepository
	{
		private readonly IDalSession _session;

		public CommodityRepository(IDalSession session)
		{
			_session = session;
		}

		public async Task<IEnumerable<Commodity>> ValidateCodeAsync(int id, int companyId, string code)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<Commodity>("[dbo].[BKO_Commodity_ValidateCode]", new
			{
				inId = id,
				inCompanyId = companyId,
				inCode = code
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<Commodity>> GetAllActiveAsync(int companyId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<Commodity>("[dbo].[BKO_Commodity_GetAll]", new
			{
				inCompanyId = companyId
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<Commodity>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<Commodity>("[dbo].[BKO_Commodity_GetPaged]", new
			{
				inCompanyId = companyId,
				inPageSize = pageSize,
				inPageIndex = pageIndex,
				inSortBy = orderBy,
				inFilterBy = filterBy
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<Commodity?> GetByIdAsync(int id)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryFirstOrDefaultAsync<Commodity>("[dbo].[BKO_Commodity_GetById]", new
			{
				inId = id
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<Commodity?> CreateOrUpdateAsync(Commodity entity, Guid userId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_Commodity_CreateOrUpdate]", new
			{
				inId = entity.Id,
				inCompanyId = entity.CompanyId,
				inCode = entity.Code,
				inDescription = entity.Description,
				inCustomsDuty = entity.CustomsDuty,
				inCustomsGct = entity.CustomsGct,
				inCustomsFee = entity.CustomsFee,
				inStatus = (byte)entity.Status,
				inUserId = userId
			}, null, null, System.Data.CommandType.StoredProcedure);

			if (int.TryParse(newId.ToString(), out int idOutput) && entity.Status != BaseEntityStatus.Deleted)
			{
				entity.Id = idOutput;
			}

			return entity;
		}

		public async Task<int> ValidateDeleteAsync(int id)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_Commodity_ValidateDelete]", new
			{
				inId = id,
			}, null, null, System.Data.CommandType.StoredProcedure);

			if (int.TryParse(newId.ToString(), out int idOutput))
			{
				id = idOutput;
			}

			return id;
		}
	}
}
