using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public interface ISystemSettingService
    {
        Task<GenericResponse<IEnumerable<SystemSettingModel>>> GetAllAsync();
        Task<GenericResponse<bool>> BulkUpdateAsync(IEnumerable<SystemSettingModel> entities, Guid userId);
        
    }
}
