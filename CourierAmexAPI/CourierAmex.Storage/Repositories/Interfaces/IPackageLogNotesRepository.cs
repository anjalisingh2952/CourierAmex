using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
  public interface IPackageLogNotesRepository
    {
        Task<PackageLogNotes> GetByIdAsync(int id);
        Task<IEnumerable<PackageLogNotes>> GetAllActiveAsync(string codigoCliente);
        Task<IEnumerable<PackageLogNotes>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", string codigoCliente = "", int numeroPckg = 0);
        Task<IEnumerable<PackageLogNotes>> GetByNumeroByClienteAsync(int? numero, string codigoCliente);
        Task<PackageLogNotes?> CreateOrUpdateAsync(PackageLogNotes entity, Guid userId);
  }
}
