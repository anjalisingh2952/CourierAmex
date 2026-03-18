using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IDocumentTypeService
    {
        Task<GenericResponse<DocumentTypeModel>> GetByIdAsync(int id);
        Task<PagedResponse<DocumentTypeModel>> GetPagedAsync(FilterByRequest request, int companyId = 0);
        Task<GenericResponse<DocumentTypeModel>> CreateAsync(DocumentTypeModel entity, Guid userId);
        Task<GenericResponse<DocumentTypeModel>> UpdateAsync(DocumentTypeModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
