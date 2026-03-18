using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IDocumentPayTypeRepository
    {
        Task<IEnumerable<DocumentPayType>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);

        Task<DocumentPayType?> GetByIdAsync(int id);

        Task<DocumentPayType?> CreateOrUpdateAsync(DocumentPayType entity, Guid userId);


    }
}
