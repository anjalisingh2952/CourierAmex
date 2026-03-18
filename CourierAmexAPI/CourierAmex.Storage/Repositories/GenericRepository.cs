using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
	public class GenericRepository<T> : IGenericRepository<T> where T : IBaseEntity
	{
		private readonly string _tableName;
		private readonly IDalSession _session;

		public GenericRepository(string tableName, IDalSession session)
		{
			_tableName = tableName;
			_session = session;
		}

		public async Task<IEnumerable<T>> GetAllActiveAsync()
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<T>("[dbo].[BKO_Catalog_GetAllActive]", new
			{
				inTableName = _tableName
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<T>> GetPagedAsync(short pageSize, short pageIndex, string orderBy = "", string filterBy = "")
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<T>("[dbo].[BKO_Catalog_GetPaged]", new
			{
				inTableName = _tableName,
				inPageSize = pageSize,
				inPageIndex = pageIndex,
				inSortBy = orderBy,
				inFilterBy = filterBy
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<T?> GetByIdAsync(Guid id)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryFirstOrDefaultAsync<T>("[dbo].[BKO_Catalog_GetById]", new
			{
				inTableName = _tableName,
				inId = id
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<T?> CreateOrUpdateAsync(T entity, Guid userId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			var newId = await connection.QuerySingleOrDefaultAsync<Guid>("[dbo].[BKO_Catalog_CreateOrUpdate]", new
			{
				inTableName = _tableName,
				inId = entity.Id,
				inStatus = (byte)entity.Status,
				inUserId = userId
			}, null, null, System.Data.CommandType.StoredProcedure);

			if (Guid.TryParse(newId.ToString(), out Guid guidOutput) && entity.Status != BaseEntityStatus.Deleted)
			{
				entity.Id = guidOutput;
			}

			return entity;
		}
	}
}
