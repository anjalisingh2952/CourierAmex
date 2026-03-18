using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IBankService
    {
        Task<GenericResponse<IEnumerable<BankModel>>> GetByCompanyAsync(int companyId);

        Task<GenericResponse<IEnumerable<BrandModel>>> GetBrandByCompanyAsync(int companyId);

    }
}
