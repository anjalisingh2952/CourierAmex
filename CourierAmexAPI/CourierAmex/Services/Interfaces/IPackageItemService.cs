using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public interface IPackageItemService
    {
        Task<GenericResponse<PackageItemModel>> GetByIdAsync(int id);
        Task<PagedResponse<PackageItemModel>> GetPagedAsync(FilterByRequest request, int P_number);
        Task<GenericResponse<PackageItemModel>> CreateAsync(PackageItemModel entity, Guid userId);
        Task<GenericResponse<PackageItemModel>> UpdateAsync(PackageItemModel entity, Guid userId);
        Task<GenericResponse<bool>> DeleteAsync(int id, Guid userId);
        Task<PagedResponse<PackageItemModel_PreviousReport_PreStudy>> GetPackageItems_PreStudyAsync(FilterByRequest request, string manifestNumber, string packageNumbers, int companyid);
        Task<GenericResponse<int>> UpdateBillingDetailsAsync(PackageItemModel_PreviousReport_PreStudy entity, Guid userId);
    }
}
