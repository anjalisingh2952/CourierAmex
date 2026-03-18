using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public interface ICustomerService
    {
        Task<GenericResponse<IEnumerable<CustomerModel>>> GetAllActiveAsync();
        Task<GenericResponse<CustomerModel>> GetByIdAsync(long id);
        Task<PagedResponse<CustomerModel>> GetPagedAsync(int countryId, FilterByRequest request);
        Task<GenericResponse<CustomerModel>> CreateAsync(CustomerModel entity, Guid userId);
        Task<GenericResponse<CustomerModel>> UpdateAsync(CustomerModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
        Task<GenericResponse<CustomerModel>> GetByCodeAsync(string id);

        Task<GenericResponse<IEnumerable<CustomerCreditModel>>> GetEnabledCreditsAsync(string? filter, int companyId);
        Task<GenericResponse<string>> EnableCustomerCreditAsync(string customerCode, int companyId);
        Task<GenericResponse<IEnumerable<CustomerCreditModel>>> GetEnabledCustomerCreditsAsync(int companyId);

        Task<GenericResponse<string>> DisableCustomerCreditAsync(string customerCode, int companyId);



    }
}
