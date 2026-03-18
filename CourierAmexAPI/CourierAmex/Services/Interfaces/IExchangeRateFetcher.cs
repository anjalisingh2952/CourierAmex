using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public interface IExchangeRateFetcher
    {
        Task<GenericResponse<decimal?>> GetUsdSaleRateAsync(DateTime start, DateTime end);
        Task<GenericResponse<decimal?>> GetUsdBuyRateAsync(DateTime start, DateTime end);
        Task<GenericResponse<int>> AddExchangeRateASync(ExchangeRateModel entities);
        Task<GenericResponse<List<ExchangeRateHistoryResponse>>> GetExchangeRateHistoryAsync(int companyId, string? date);


    }

}
