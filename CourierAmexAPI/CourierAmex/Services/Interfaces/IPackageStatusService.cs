using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IPackageStatusService
    {
        Task<GenericResponse<PackageStatusModel>> GetByIdAsync(int id);
        Task<PagedResponse<PackageStatusModel>> GetPagedAsync(FilterByRequest request);
        Task<GenericResponse<PackageStatusModel>> CreateAsync(PackageStatusModel entity, Guid userId);
        Task<GenericResponse<PackageStatusModel>> UpdateAsync(PackageStatusModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
