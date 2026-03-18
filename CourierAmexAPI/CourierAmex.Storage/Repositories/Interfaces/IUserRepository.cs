using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
  public interface IUserRepository
  {
    Task<IEnumerable<User>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "");
    Task<IEnumerable<User>> ValidateUsernameAsync(Guid id, string username);
    Task<IEnumerable<Permission>> GetPermissionsAsync(Guid id);
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByResetKeyAsync(string resetKey);
    Task<User?> LoginAsync(string email);
    Task<User?> CreateOrUpdateAsync(User entity, Guid userId);
    Task UpdateLoginDateAsync(User request);
    Task UpdateResetKeyAsync(User request);
    Task UpdatePasswordAsync(User request);
  }
}
