using CourierAmex.Models;

namespace CourierAmex.Services.Interfaces
{
    public interface IPackageNotesService
    {
        Task<GenericResponse<PackageNotesModel>> GetByIdAsync(int id);
        Task<PagedResponse<PackageNotesModel>> GetByNumeroByClienteAsync(int? numero, string codigoCliente);
        Task<PagedResponse<PackageNotesModel>> GetPagedAsync(FilterByRequest request, int cid, string codigoCliente = "", string numeroCourier = "");
        Task<GenericResponse<PackageNotesModel>> CreateAsync(PackageNotesModel entity, Guid userId);
        Task<GenericResponse<PackageNotesModel>> UpdateAsync(PackageNotesModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
