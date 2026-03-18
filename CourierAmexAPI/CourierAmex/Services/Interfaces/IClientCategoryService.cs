using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IClientCategoryService
    {
        Task<GenericResponse<ClientCategoryModel>> GetByIdAsync(byte id);
        Task<PagedResponse<ClientCategoryModel>> GetPagedAsync(FilterByRequest request, int companyId);
        Task<GenericResponse<ClientCategoryModel>> CreateAsync(ClientCategoryModel entity, Guid userId);
        Task<GenericResponse<ClientCategoryModel>> UpdateAsync(ClientCategoryModel entity, Guid userId);
        Task DeleteAsync(byte id, Guid userId);
    }
}
