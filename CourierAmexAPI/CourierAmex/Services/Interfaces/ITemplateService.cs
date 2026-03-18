using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface ITemplateService
    {
        Task<IEnumerable<TemplateModel>> GetByCompanyModuleAsync(string moduleId, int companyId);
    }
}
