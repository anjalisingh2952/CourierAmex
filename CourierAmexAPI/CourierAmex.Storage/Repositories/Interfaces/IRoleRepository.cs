using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
  public interface IRoleRepository
  {
        Task<IEnumerable<Role>> GetAllActiveAsync(int companyId);
        Task<IEnumerable<Role>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
        Task<Role?> GetByIdAsync(Guid id);
        Task<Role?> CreateOrUpdateAsync(Role entity, Guid userId);
  }
}
