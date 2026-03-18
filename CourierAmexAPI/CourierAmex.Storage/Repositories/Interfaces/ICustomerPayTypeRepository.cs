using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
  public interface ICustomerPayTypeRepository
    {
        Task<IEnumerable<CustomerPayType>> GetAllActiveAsync(int companyId);
        Task<IEnumerable<CustomerPayType>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
        Task<CustomerPayType?> GetByIdAsync(int id);
        Task<CustomerPayType?> CreateOrUpdateAsync(CustomerPayType entity, Guid userId);
  }
}
