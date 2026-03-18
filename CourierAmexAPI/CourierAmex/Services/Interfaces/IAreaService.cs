using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IAreaService
    {
        Task<GenericResponse<AreaModel>> GetByIdAsync(int id);
        Task<PagedResponse<AreaModel>> GetPagedAsync(FilterByRequest request, int countryId, int stateId, int zoneId);
        Task<GenericResponse<AreaModel>> CreateAsync(AreaModel entity, Guid userId);
        Task<GenericResponse<AreaModel>> UpdateAsync(AreaModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
