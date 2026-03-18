using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface ICustomerPayTypeService
    {
        Task<GenericResponse<CustomerPayTypeModel>> GetByIdAsync(int id);
        Task<PagedResponse<CustomerPayTypeModel>> GetPagedAsync(FilterByRequest request, int companyId = 0);
        Task<GenericResponse<CustomerPayTypeModel>> CreateAsync(CustomerPayTypeModel entity, Guid userId);
        Task<GenericResponse<CustomerPayTypeModel>> UpdateAsync(CustomerPayTypeModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
