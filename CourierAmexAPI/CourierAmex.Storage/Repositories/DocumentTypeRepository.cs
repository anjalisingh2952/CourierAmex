using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
	public class DocumentTypeRepository : IDocumentTypeRepository
	{
		private readonly IDalSession _session;

		public DocumentTypeRepository(IDalSession session)
		{
			_session = session;
		}

		public async Task<IEnumerable<DocumentType>> GetByCompanyAsync(int companyId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<DocumentType>("[dbo].[BKO_DocumentType_GetByCompany]", new
            {
                inCompanyId = companyId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

		public async Task<IEnumerable<DocumentType>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<DocumentType>("[dbo].[BKO_DocumentType_GetPaged]", new
			{
				inCompanyId = companyId,
				inPageSize = pageSize,
				inPageIndex = pageIndex,
				inSortBy = orderBy,
				inFilterBy = filterBy
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<DocumentType?> GetByIdAsync(int id)
		{
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<DocumentType>("[dbo].[BKO_DocumentType_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

		public async Task<DocumentType?> CreateOrUpdateAsync(DocumentType entity, Guid userId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_DocumentType_CreateOrUpdate]", new
			{
				inId = entity.Id,
				inCompanyId = entity.CompanyId,
				inName = entity.Name,
				inMask = entity.Mask ?? "",
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
