using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IBankRepository
    {
        Task<IEnumerable<Bank>> GetByCompanyAsync(int companyId);
        Task<IEnumerable<Brand>> GetBrandByCompanyAsync(int companyId);

    }
}
