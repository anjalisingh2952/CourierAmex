using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface ISystemSettingRepository
    {
        Task<IEnumerable<SystemSetting>> GetAllAsync();
        Task BulkUpdateAsync(IEnumerable<SystemSetting> entity, Guid userId);
       
    }
}
