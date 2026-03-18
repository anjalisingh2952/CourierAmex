using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface ILocationService
    {
        Task<IEnumerable<LocationModel>> GetByCompanyAsync(int companyId, int supplierId = 0);
        Task<GenericResponse<LocationModel>> GetByIdAsync(int id);
        Task<PagedResponse<LocationModel>> GetPagedAsync(FilterByRequest request, int companyId = 0);
        Task<GenericResponse<LocationModel>> CreateAsync(LocationModel entity, Guid userId);
        Task<GenericResponse<LocationModel>> UpdateAsync(LocationModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
