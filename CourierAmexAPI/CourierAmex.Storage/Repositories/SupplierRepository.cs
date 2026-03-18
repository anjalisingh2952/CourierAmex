using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
	public class SupplierRepository : ISupplierRepository
	{
		private readonly IDalSession _session;

		public SupplierRepository(IDalSession session)
		{
			_session = session;
		}

		public async Task<IEnumerable<Supplier>> GetByCompanyAsync(int companyId)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<Supplier>("[dbo].[BKO_Supplier_GetByCompany]", new
			{
				inCompanyId = companyId
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<IEnumerable<Supplier>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryAsync<Supplier>("[dbo].[BKO_Supplier_GetPaged]", new
			{
				inCompanyId = companyId,
				inPageSize = pageSize,
				inPageIndex = pageIndex,
				inSortBy = orderBy,
				inFilterBy = filterBy
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<Supplier?> GetByIdAsync(int id)
		{
			var connection = await _session.GetReadOnlyConnectionAsync();
			return await connection.QueryFirstOrDefaultAsync<Supplier>("[dbo].[BKO_Supplier_GetById]", new
			{
				inId = id
			}, null, null, System.Data.CommandType.StoredProcedure);
		}

		public async Task<Supplier?> CreateOrUpdateAsync(Supplier entity, Guid userId)
		{
			var ids = entity.Locations?.Select(x => x.Id)?.ToList();
			string locations = string.Join(",", ids ?? new List<int>());

			var connection = await _session.GetReadOnlyConnectionAsync();
			var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_Supplier_CreateOrUpdate]", new
			{
				inId = entity.Id,
				inCompanyId = entity.CompanyId,
				inCountryId = entity.CountryId,
				inName = entity.Name,
				inAddress = entity.Address ?? "",
				inPhone = entity.Phone ?? "",
				inContact = entity.Contact ?? "",
				inLocations = locations,
				inStatus = (byte)entity.Status,
				inUserId = userId
			}, null, null, System.Data.CommandType.StoredProcedure);

			if (int.TryParse(newId.ToString(), out int idOutput) && entity.Status != BaseEntityStatus.Deleted)
			{
				entity.Id = idOutput;
			}

			return entity;
		}


        public async Task<IEnumerable<PurchaseReport>> GetPurchasesReportAsync(DateTime startDate, DateTime endDate, int companyId)
        {
            
            using var connection = await _session.GetReadOnlyConnectionAsync();

            
            return await connection.QueryAsync<PurchaseReport>(
                "[dbo].[BKO_Report_Purchases]",   
                new
                {
                    StartDate = startDate,         
                    EndDate = endDate,             
                    CompanyId = companyId         
                },
                 null, null, System.Data.CommandType.StoredProcedure 
            );
        }




    }
}
