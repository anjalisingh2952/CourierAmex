using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface ISupplierRepository
    {
        Task<IEnumerable<Supplier>> GetByCompanyAsync(int companyId);
        Task<IEnumerable<Supplier>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
        Task<Supplier?> GetByIdAsync(int id);
        Task<Supplier?> CreateOrUpdateAsync(Supplier entity, Guid userId);
        Task<IEnumerable<PurchaseReport>> GetPurchasesReportAsync(DateTime startDate, DateTime endDate, int companyId);
    }

}
