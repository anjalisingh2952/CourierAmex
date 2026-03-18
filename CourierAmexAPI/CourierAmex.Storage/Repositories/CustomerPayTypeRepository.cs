using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
	public class CustomerPayTypeRepository : ICustomerPayTypeRepository
	{
		private readonly IDalSession _session;

		public CustomerPayTypeRepository(IDalSession session)
		{
			_session = session;
		}

		public async Task<IEnumerable<CustomerPayType>> GetAllActiveAsync(int companyId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<CustomerPayType>("[dbo].[BKO_CustomerPayType_GetAll]", new
			{
				inCompanyId = companyId
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<CustomerPayType>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<CustomerPayType>("[dbo].[BKO_CustomerPayType_GetPaged]", new
			{
				inCompanyId = companyId,
				inPageSize = pageSize,
				inPageIndex = pageIndex,
				inSortBy = orderBy,
				inFilterBy = filterBy
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<CustomerPayType?> GetByIdAsync(int id)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryFirstOrDefaultAsync<CustomerPayType>("[dbo].[BKO_CustomerPayType_GetById]", new
			{
				inId = id
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<CustomerPayType?> CreateOrUpdateAsync(CustomerPayType entity, Guid userId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_CustomerPayType_CreateOrUpdate]", new
			{
				inId = entity.Id,
				inCompanyId = entity.CompanyId,
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
