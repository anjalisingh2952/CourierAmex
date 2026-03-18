using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using System.Data;

namespace CourierAmex.Storage.Repositories
{
    public class CompanyRepository : ICompanyRepository
    {
        private readonly IDalSession _session;

        public CompanyRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Company>> GetAllAsync()
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Company>("[dbo].[BKO_Company_GetAllActive]", null, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Product>> GetProductsByCompanyAsync(int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Product>("[dbo].[BKO_Products_GetByCompany]", new
            {
                inCompanyId = companyId,
                }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Company>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int countryId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Company>("[dbo].[BKO_Company_GetPaged]", new
            {
                inCountryId = countryId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Company?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<Company>("[dbo].[BKO_Company_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Company?> CreateOrUpdateAsync(Company entity, Guid userId)
        {
            int? id = entity.Id > 0 ? entity.Id : null;

            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_Company_CreateOrUpdate]", new
            {
                inId = id,
                inName = entity.Name,
                inCode = entity.Code ?? "",
                inAddress = entity.Address ?? "",
                inMaxLevel = entity.MaxLevel,
                isPhone = entity.Phone,
                isEmail = entity.Email,
                inFiscalMonth = entity.FiscalMonth,
                inCurrencyId = entity.CurrencyId,
                inCountryId = entity.CountryId,
                inIsCommodityRequired = entity.IsCommodityRequired,
                inWeightUnit = entity.WeightUnit,
                inStatus = (byte)entity.Status,
                inUserId = userId,
                inAttachmentUrl = entity.AttachmentUrl
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (int.TryParse(newId.ToString(), out int idOutput) && entity.Status != BaseEntityStatus.Deleted)
            {
                entity.Id = idOutput;
            }

            return entity;
        }

        public async Task<CompanyAttachmentUrl> GetAttachmentUrlByCompanyIdAsync(int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<CompanyAttachmentUrl>(
                "[dbo].[BKO_GetUrlAttachmentByCompanyId]",
                new { CompanyId = companyId },
                commandType: CommandType.StoredProcedure
            );
        }



    }
}
