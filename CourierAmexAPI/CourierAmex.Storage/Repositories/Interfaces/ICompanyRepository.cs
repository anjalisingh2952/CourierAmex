using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface ICompanyRepository
    {
        Task<IEnumerable<Company>> GetAllAsync();
        Task<IEnumerable<Product>> GetProductsByCompanyAsync(int companyId);
        Task<IEnumerable<Company>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int countryId = 0);
        Task<Company?> GetByIdAsync(int id);
        Task<Company?> CreateOrUpdateAsync(Company entity, Guid userId);
        Task<CompanyAttachmentUrl> GetAttachmentUrlByCompanyIdAsync(int companyId);

    }
}
