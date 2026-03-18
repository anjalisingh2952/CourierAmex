using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IZoneRepository
    {
        Task<IEnumerable<Zone>> GetByStateAsync(int stateId);
        Task<IEnumerable<Zone>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int countryId = 0, int stateId = 0);
        Task<Zone?> GetByIdAsync(int id);
        Task<Zone?> CreateOrUpdateAsync(Zone entity, Guid userId);
    }
}
