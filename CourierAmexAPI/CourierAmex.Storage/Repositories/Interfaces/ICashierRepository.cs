using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface ICashierRepository
    {
        Task<IEnumerable<Cashier>> GetAllAsync();
        Task<IEnumerable<Cashier>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
        Task<Cashier?> GetByIdAsync(int id);
        Task<Cashier?> CreateOrUpdateAsync(Cashier entity, Guid userId);
        Task<IEnumerable<UserByPointOfSale>> GetUserByPointOfSaleAsync(int companyId, int pointOfSaleId);
        Task<bool?> InsertUserToCashierAsync(int companyId, int pointOfSaleId, string UserName);
    }
}
