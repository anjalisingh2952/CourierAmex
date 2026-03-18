using CourierAmex.Models;
using Org.BouncyCastle.Asn1;

namespace CourierAmex.Services
{
    public interface IPackageLogNotesService
    {
        Task<PagedResponse<PackageLogNotesModel>> GetByNumeroByClienteAsync(int? numero, string codigoCliente);
        Task<PagedResponse<PackageLogNotesModel>> GetPagedAsync(FilterByRequest request, string codigoCliente = "", int numeroPckg = 0);
        Task<GenericResponse<PackageLogNotesModel>> CreateAsync(PackageLogNotesModel entity, Guid userId);
        Task<GenericResponse<PackageLogNotesModel>> UpdateAsync(PackageLogNotesModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
