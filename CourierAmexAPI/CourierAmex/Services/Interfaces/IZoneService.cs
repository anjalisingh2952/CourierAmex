using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IZoneService
    {
        Task<GenericResponse<ZoneModel>> GetByIdAsync(int id);
        Task<PagedResponse<ZoneModel>> GetPagedAsync(FilterByRequest request, int countryId, int stateId);
        Task<GenericResponse<ZoneModel>> CreateAsync(ZoneModel entity, Guid userId);
        Task<GenericResponse<ZoneModel>> UpdateAsync(ZoneModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
