using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IPackageStatusRepository
    {
        Task<IEnumerable<PackageStatus>> GetActiveAsync();
        Task<IEnumerable<PackageStatus>> ValidateCodeAsync(int id, string code);
        Task<IEnumerable<PackageStatus>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "");
        Task<PackageStatus?> GetByIdAsync(int id);
        Task<PackageStatus?> CreateOrUpdateAsync(PackageStatus entity, Guid userId);
    }
}
