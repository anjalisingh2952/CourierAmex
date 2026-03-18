using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IGenericRepository<T> where T : IBaseEntity
    {
        Task<IEnumerable<T>> GetAllActiveAsync();
        Task<IEnumerable<T>> GetPagedAsync(short pageSize, short pageIndex, string orderBy = "", string filterBy = "");
        Task<T?> GetByIdAsync(Guid id);
        Task<T?> CreateOrUpdateAsync(T entity, Guid userId);
    }
}
