using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
    public class BankRepository:IBankRepository
    {
        private readonly IDalSession _session;

        public BankRepository(IDalSession session)
        {
            _session = session;

        }

        public async Task<IEnumerable<Bank>> GetByCompanyAsync(int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Bank>("[dbo].[BKO_Bank_GetByCompany]", new
            {
                inCompanyId = companyId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Brand>> GetBrandByCompanyAsync(int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Brand>("[dbo].[BKO_Brand_GetByCompany]", new
            {
                inCompanyId = companyId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

    }
}
