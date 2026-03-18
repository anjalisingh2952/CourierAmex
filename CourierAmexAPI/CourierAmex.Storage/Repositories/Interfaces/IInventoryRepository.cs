

using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories

{
    public interface IInventoryRepository
    {

        Task<IEnumerable<StoreInventoryPackage>> GetStoreInventoryPackagesAsync(int companyId, int storeId);

        Task <int> InsertInventoryPackageAsync(int storeId, int packageNumber, string userName, DateTime date);

        Task<int> DeleteInventoryPackageAsync(int storeId, int packageNumber, int deleteAll);

        Task<int> ResendPackageNotificationAsync(int packageNumber, string documentType);
        Task<IEnumerable<StoreInventory>> GetStoreInventoryAsync(int storeId, string companyId);
    }



}