using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using System.Net.NetworkInformation;
using System.Xml.Linq;

namespace CourierAmex.Storage.Repositories
{
    public class DocumentPayTypeRepository: IDocumentPayTypeRepository
    {
        private readonly IDalSession _session;

        public DocumentPayTypeRepository(IDalSession session)
        {
            _session = session;

        }
        public async Task<IEnumerable<DocumentPayType>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<DocumentPayType>("[dbo].[BKO_DocumentPayType_GetPaged]", new
            {
                inCompanyId = companyId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<DocumentPayType?> GetByIdAsync(int id)
		{
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryFirstOrDefaultAsync<DocumentPayType>("[dbo].[BKO_DocumentPayType_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<DocumentPayType?> CreateOrUpdateAsync(DocumentPayType entity, Guid userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_DocumentPayType_CreateOrUpdate]", new
            {
                inId = entity.Id,
                inCompanyId = entity.CompanyId,
                inBankId = entity.BankId,
                inBrandId = entity.BrandId,
                inPayTypeId = entity.PayTypeId,
                inName = entity.Name,
                inCurrencyCode = entity.CurrencyCode,
                inBankComission = entity.BankComission,
                inVATWithholding = entity.VATWithholding,
                inIncomeWithholding = entity.IncomeWithholding,
                inModuleId = entity.ModuleId,
                inTemplateId = entity.TemplateId,                
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