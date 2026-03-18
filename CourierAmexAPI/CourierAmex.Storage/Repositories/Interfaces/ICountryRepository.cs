using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface ICountryRepository
    {
        Task<IEnumerable<Country>> GetAllAsync();
        Task<IEnumerable<Country>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "");
        Task<Country?> GetByIdAsync(int id);
        Task<Country?> CreateOrUpdateAsync(Country entity, Guid userId);
    }
}
