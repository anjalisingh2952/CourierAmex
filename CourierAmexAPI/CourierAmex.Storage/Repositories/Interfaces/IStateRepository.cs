using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IStateRepository
    {
        Task<IEnumerable<State>> GetByCountryAsync(int countryId);
        Task<IEnumerable<State>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int countryId = 0);
        Task<State?> GetByIdAsync(int id);
        Task<State?> CreateOrUpdateAsync(State entity, Guid userId);
    }
}
