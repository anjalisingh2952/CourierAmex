using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IPackageItemRepository
    {
        Task<PackageItem?> GetByIdAsync(int id);
        Task<IEnumerable<PackageItem>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int P_number = 0);
        Task<PackageItem?> CreateOrUpdateAsync(PackageItem entity);
        Task<int> ValidateDeleteAsync(int id);
        Task<IEnumerable<PackageItemModel_PreviousReport_PreStudy>> GetPaged_PackageItems_PreStudy_Async(int pageSize, short pageIndex, string sort, string criteria, string manifestNumber, string packageNumbers, int companyid);
        Task<int?> UpdateBillingDetails(PackageItemModel_PreviousReport_PreStudy entity, Guid userId);
    }
}
