using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public interface ISupplierService
    {
        Task<IEnumerable<SupplierModel>> GetByCompanyAsync(int companyId);
        Task<GenericResponse<SupplierModel>> GetByIdAsync(int id);
        Task<PagedResponse<SupplierModel>> GetPagedAsync(FilterByRequest request, int companyId = 0);
        Task<GenericResponse<SupplierModel>> CreateAsync(SupplierModel entity, Guid userId);
        Task<GenericResponse<SupplierModel>> UpdateAsync(SupplierModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);

        Task<GenericResponse<List<PurchaseReport>>> GetPurchasesReportAsync(DateTime startDate, DateTime endDate, int companyId);
    
}
}
