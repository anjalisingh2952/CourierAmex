using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IUserService
    {
        Task<GenericResponse<UserModel>> GetByIdAsync(string id);
        Task<PagedResponse<UserModel>> GetPagedAsync(FilterByRequest request);
        Task<GenericResponse<UserModel>> CreateAsync(UserModel entity, Guid userId);
        Task<GenericResponse<UserModel>> UpdateAsync(UserModel entity, Guid userId);
        Task DeleteAsync(string id, Guid userId);
        Task<GenericResponse<bool>> CreatePasswordAsync(ResetRequest entity, Guid userId);
        Task<GenericResponse<bool>> ChangePasswordAsync(ChangePasswordModel request, Guid userId);
    }
}
