using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
  public interface IPermissionRepository
  {
    Task<IEnumerable<Permission>> GetAllAsync();
  }
}
