using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
  public interface IDocumentTypeRepository
    {
        Task<IEnumerable<DocumentType>> GetByCompanyAsync(int companyId);
        Task<IEnumerable<DocumentType>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
        Task<DocumentType?> GetByIdAsync(int id);
        Task<DocumentType?> CreateOrUpdateAsync(DocumentType entity, Guid userId);
  }
}
