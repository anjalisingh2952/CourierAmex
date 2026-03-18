using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface ICashierService
    {
        Task<GenericResponse<IEnumerable<CashierModel>>> GetAllActiveAsync();
        Task<GenericResponse<CashierModel>> GetByIdAsync(int id);
        Task<PagedResponse<CashierModel>> GetPagedAsync(FilterByRequest request, int companyId);
        Task<GenericResponse<CashierModel>> CreateAsync(CashierModel entity, Guid userId);
        Task<GenericResponse<CashierModel>> UpdateAsync(CashierModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
        Task<List<UserByPointOfSaleModel>> GetUserByPointOfSale(int companyId, int pointOfSaleId);

        Task<GenericResponse<bool>> InsertUserToCashier(int companyId, int pointOfSaleId, string userName);
    }
}
