using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public interface ICompanyService
    {
        Task<GenericResponse<IEnumerable<CompanyModel>>> GetAllActiveAsync();
        Task<GenericResponse<CompanyModel>> GetByIdAsync(int id);
        Task<PagedResponse<CompanyModel>> GetPagedAsync(FilterByRequest request, int countryId);
        Task<GenericResponse<CompanyModel>> CreateAsync(CompanyModel entity, Guid userId);
        Task<GenericResponse<CompanyModel>> UpdateAsync(CompanyModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
        Task<GenericResponse<CompanyAttachmentUrl>> GetAttachmentUrlByCompanyIdAsync(int companyId);


    }
}
