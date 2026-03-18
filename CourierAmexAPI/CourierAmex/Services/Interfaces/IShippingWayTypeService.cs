using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IShippingWayTypeService
    {
        Task<GenericResponse<ShippingWayTypeModel>> GetByIdAsync(int id);
        Task<PagedResponse<ShippingWayTypeModel>> GetPagedAsync(FilterByRequest request);
        Task<GenericResponse<ShippingWayTypeModel>> CreateAsync(ShippingWayTypeModel entity, Guid userId);
        Task<GenericResponse<ShippingWayTypeModel>> UpdateAsync(ShippingWayTypeModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
