using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IProductService
    {
        Task<IEnumerable<ProductModel>> GetByCompanyAsync(int companyId);
    }
}
