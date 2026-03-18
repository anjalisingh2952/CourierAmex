using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface ICustomerRepository
    {
        Task<IEnumerable<Customer>> GetAllAsync();
        Task<IEnumerable<Customer>> GetPagedAsync(int companyId, int pageSize, short pageIndex, string orderBy = "", string filterBy = "");
        Task<Customer?> GetByIdAsync(long id);
        Task<Customer?> CreateOrUpdateAsync(Customer entity, Guid userId);
        Task<Customer?> GetByCodeAsync(string code);

        Task<IEnumerable<CustomerCreditModel>> GetEnabledCreditsAsync(string? filter, int companyId);
        Task<int> EnableCustomerCreditAsync(string customerCode, int companyId);
        Task<IEnumerable<CustomerCreditModel>> GetEnabledCustomerCreditsAsync(int companyId);

        Task<int> DisableCustomerCreditAsync(string customerCode, int companyId);




    }
}
