using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface ICountryService
    {
        Task<GenericResponse<CountryModel>> GetByIdAsync(int id);
        Task<PagedResponse<CountryModel>> GetPagedAsync(FilterByRequest request);
        Task<GenericResponse<CountryModel>> CreateAsync(CountryModel entity, Guid userId);
        Task<GenericResponse<CountryModel>> UpdateAsync(CountryModel entity, Guid userId);
        Task DeleteAsync(int id, Guid userId);
    }
}
