using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IPackageNotesRepository
    {
        Task<PackageNotes> GetByIdAsync(int id);
        Task<IEnumerable<PackageNotes>> GetAllActiveAsync(string codigoCliente);
        Task<IEnumerable<PackageNotes>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", string codigoCliente = "", string numeroCourier = "", int companyId=0);
        Task<IEnumerable<PackageNotes>> GetByNumeroByClienteAsync(int? numero, string codigoCliente);
        Task<PackageNotes?> CreateOrUpdateAsync(PackageNotes entity, Guid userId);
    }
}
