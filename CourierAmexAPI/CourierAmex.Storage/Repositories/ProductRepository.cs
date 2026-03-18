using Dapper;

using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public class ProductRepository : IProductRepository
    {
        private readonly IDalSession _session;

        public ProductRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Product>> GetByCompanyAsync(int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Product>("[dbo].[BKO_Products_GetByCompany]", new
            {
                inCompanyId = companyId,
            }, null, null, System.Data.CommandType.StoredProcedure);
        }
    }
}
