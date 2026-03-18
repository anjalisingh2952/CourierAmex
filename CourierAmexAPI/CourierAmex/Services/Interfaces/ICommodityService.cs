using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface ICommodityService
    {
        Task<GenericResponse<CommodityModel>> GetByIdAsync(int id);
        Task<PagedResponse<CommodityModel>> GetPagedAsync(FilterByRequest request, int companyId = 0);
        Task<GenericResponse<CommodityModel>> CreateAsync(CommodityModel entity, Guid userId);
        Task<GenericResponse<CommodityModel>> UpdateAsync(CommodityModel entity, Guid userId);
        Task<GenericResponse<bool>> DeleteAsync(int id, Guid userId);
    }
}
