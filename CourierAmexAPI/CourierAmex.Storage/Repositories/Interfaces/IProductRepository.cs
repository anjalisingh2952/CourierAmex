using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IProductRepository
    {
        Task<IEnumerable<Product>> GetByCompanyAsync(int companyId);
    }
}
