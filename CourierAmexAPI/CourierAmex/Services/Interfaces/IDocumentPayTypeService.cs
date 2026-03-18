using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IDocumentPayTypeService
    {
        Task<GenericResponse<DocumentPayTypeModel>> GetByIdAsync(int id);
        Task<PagedResponse<DocumentPayTypeModel>> GetPagedAsync(FilterByRequest request, int companyId = 0);

        Task<GenericResponse<DocumentPayTypeModel>> CreateAsync(DocumentPayTypeModel entity, Guid userId);

        Task<GenericResponse<DocumentPayTypeModel>> UpdateAsync(DocumentPayTypeModel entity, Guid userId);

        Task DeleteAsync(int id, Guid userId);
    }
}
