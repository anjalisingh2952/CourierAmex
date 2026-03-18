using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
  public interface IPaymentTypeRepository
    {
        Task<IEnumerable<PaymentType>> GetAllActiveAsync(int companyId);
        Task<IEnumerable<PaymentType>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
        Task<PaymentType?> GetByIdAsync(int id);
        Task<PaymentType?> CreateOrUpdateAsync(PaymentType entity, Guid userId);
  }
}
