using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IRoleService
    {
        Task<IEnumerable<RoleModel>> GetAllActiveAsync(int companyId);
        Task<GenericResponse<RoleModel>> GetByIdAsync(string id);
        Task<PagedResponse<RoleModel>> GetPagedAsync(FilterByRequest request);
        Task<GenericResponse<RoleModel>> CreateAsync(RoleModel entity, Guid userId);
        Task<GenericResponse<RoleModel>> UpdateAsync(RoleModel entity, Guid userId);
        Task DeleteAsync(string id, Guid userId);
    }
}
