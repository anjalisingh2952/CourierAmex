using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IModuleService
    {
        Task<IEnumerable<ModuleModel>> GetByCompanyAsync(int companyId);

    }
}
