using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
  public interface IShippingWayTypeRepository
    {
        Task<IEnumerable<ShippingWayType>> GetAllActiveAsync(int shipType);
        Task<IEnumerable<ShippingWayType>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "");
        Task<ShippingWayType?> GetByIdAsync(int id);
        Task<ShippingWayType?> CreateOrUpdateAsync(ShippingWayType entity, Guid userId);
  }
}
