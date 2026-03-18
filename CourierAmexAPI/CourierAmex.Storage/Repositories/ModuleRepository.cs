using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
    public class ModuleRepository:IModuleRepository
    {
        private readonly IDalSession _session;

        public ModuleRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Module>> GetByCompanyAsync(int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Module>("[dbo].[BKO_Module_GetByCompany]", new
            {
                inCompanyId = companyId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }


        
    }
}
