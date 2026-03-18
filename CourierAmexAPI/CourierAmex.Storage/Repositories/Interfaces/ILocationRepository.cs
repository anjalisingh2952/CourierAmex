using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface ILocationRepository
    {
        Task<IEnumerable<Location>> GetByCompanyAsync(int companyId, int supplierId = 0);
        Task<IEnumerable<Location>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
        Task<Location?> GetByIdAsync(int id);
        Task<Location?> CreateOrUpdateAsync(Location entity, Guid userId);
    }
}
