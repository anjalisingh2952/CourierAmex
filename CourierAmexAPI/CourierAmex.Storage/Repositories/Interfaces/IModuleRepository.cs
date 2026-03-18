using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IModuleRepository
    {   
        Task<IEnumerable<Module>> GetByCompanyAsync(int companyId);
    }
}
