using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
    public class TemplateRepository: ITemplateRepository
    {
        private readonly IDalSession _session;

        public TemplateRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Template>> GetByCompanyModuleAsync(int companyId, string moduleId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Template>("[dbo].[BKO_Template_GetByCompanyModule]", new
            {
                inCompanyId = companyId,
                inModuleId = moduleId
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

    }
}
