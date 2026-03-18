using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IClientCategoryRepository
    {
        Task<IEnumerable<ClientCategory>> GetByCompanyAsync(int companyId);
        Task<IEnumerable<ClientCategory>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
        Task<ClientCategory?> GetByIdAsync(byte id);
        Task<ClientCategory?> CreateOrUpdateAsync(ClientCategory entity, Guid userId);
    }
}
