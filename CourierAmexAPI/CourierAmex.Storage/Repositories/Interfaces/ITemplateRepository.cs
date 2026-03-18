using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface ITemplateRepository
    {
        Task<IEnumerable<Template>> GetByCompanyModuleAsync(int companyId, string moduleId);
    }
}
