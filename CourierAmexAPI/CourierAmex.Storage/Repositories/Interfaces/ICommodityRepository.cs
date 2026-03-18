using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
	public interface ICommodityRepository
	{
		Task<IEnumerable<Commodity>> ValidateCodeAsync(int id, int companyId, string code);
		Task<IEnumerable<Commodity>> GetAllActiveAsync(int companyId);
		Task<IEnumerable<Commodity>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
		Task<Commodity?> GetByIdAsync(int id);
		Task<Commodity?> CreateOrUpdateAsync(Commodity entity, Guid userId);
		Task<int> ValidateDeleteAsync(int id);
	}
}
