using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public interface ICurrencyService
    {
        Task<GenericResponse<IEnumerable<Currency>>> GetByCompanyAsync(int companyId);

    }
}
