using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;

namespace CourierAmex.Storage.Repositories
{
    public class CurrencyRepository : ICurrencyRepository
    {
        private readonly IDalSession _session;

        public CurrencyRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<Currency>> GetByCompanyAsync(int companyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Currency>("[dbo].[BKO_Currency_GetByCompany]", new
            {
                inCompanyId = companyId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ExchangeRateHistoryResponse>> GetExchangeRateHistoryAsync(int companyId, string? date)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<ExchangeRateHistoryResponse>("[dbo].[BKO_Get_ExchangeHistory]", new
            {
                COMPANYID = companyId,
                FECHA_HISTORIAL = date =="undefined"?null:date
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<int> AddExchangeRateASync(ExchangeRateModel entities)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_INSERT_EXCHNAGERATE]", new
            {
                COMPANYID = entities.CompanyId,
                SOURCECURRENCYCODE = entities.SourceCurrencyCode,
                DESTINATIONCURRENCY = entities.DestinationCurrency,
                SALERATE = entities.SaleRate,
                PURCHASERATE = entities.PurchaseRate,
                DATE = entities.Date,
            }, null, null, System.Data.CommandType.StoredProcedure);

            return newId;
        }
    }
}
