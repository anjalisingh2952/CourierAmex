using CourierAmex.Models;



namespace CourierAmex.Services.Interfaces
{
    public interface IInventoryService
    {
        Task<GenericResponse<List<StoreInventoryPackageModel>>> GetStoreInventoryPackagesAsync(int companyId, int storeId);
        Task<GenericResponse<int>> InsertInventoryPackageAsync(int storeId, int packageNumber, string userName, DateTime date);
        Task<GenericResponse<int>> DeleteInventoryPackageAsync(int storeId, int packageNumber, int deleteAll);
        Task<GenericResponse<int>> ResendPackageNotificationAsync(int packageNumber, string documentType);
        Task<GenericResponse<List<StoreInventoryReport>>> GetStoreInventoryAsync(int storeId, string companyId);
    }
}
