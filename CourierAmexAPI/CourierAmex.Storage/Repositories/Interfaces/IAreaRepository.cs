using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IAreaRepository
    {
        Task<IEnumerable<Area>> GetByZoneAsync(int zoneId);
        Task<IEnumerable<Area>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int countryId = 0, int stateId = 0, int zoneId = 0);
        Task<Area?> GetByIdAsync(int id);
        Task<Area?> CreateOrUpdateAsync(Area entity, Guid userId);
    }
}
