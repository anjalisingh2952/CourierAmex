using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IStateService
    {
        Task<GenericResponse<StateModel>> GetByIdAsync(int id);
        Task<PagedResponse<StateModel>> GetPagedAsync(FilterByRequest request, int countryId);
        Task<GenericResponse<StateModel>> CreateAsync(StateModel entity, Guid userId);
        Task<GenericResponse<StateModel>> UpdateAsync(StateModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
