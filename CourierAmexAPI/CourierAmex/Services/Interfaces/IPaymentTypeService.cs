using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IPaymentTypeService
    {
        Task<GenericResponse<PaymentTypeModel>> GetByIdAsync(int id);
        Task<PagedResponse<PaymentTypeModel>> GetPagedAsync(FilterByRequest request, int companyId = 0);
        Task<GenericResponse<PaymentTypeModel>> CreateAsync(PaymentTypeModel entity, Guid userId);
        Task<GenericResponse<PaymentTypeModel>> UpdateAsync(PaymentTypeModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
