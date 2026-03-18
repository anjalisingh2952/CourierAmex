using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface ICurrencyRepository
    {
        Task<IEnumerable<Currency>> GetByCompanyAsync(int companyId);
        Task<int> AddExchangeRateASync(ExchangeRateModel entities);
        Task<IEnumerable<ExchangeRateHistoryResponse>> GetExchangeRateHistoryAsync(int companyId, string? date);
    }
}
