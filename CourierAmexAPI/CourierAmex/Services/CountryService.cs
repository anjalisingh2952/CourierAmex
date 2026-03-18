using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class CountryService : ICountryService
    {
        private readonly ICountryRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public CountryService(IMapper mapper, ICountryRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<CountryModel>> GetByIdAsync(int id)
        {
            GenericResponse<CountryModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<CountryModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<CountryModel>> GetPagedAsync(FilterByRequest request)
        {
            PagedResponse<CountryModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<CountryModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<CountryModel>> CreateAsync(CountryModel entity, Guid userId)
        {
            GenericResponse<CountryModel> result = new();
            var Country = _mapper.Map<Entities.Country>(entity);
            if (null != Country)
            {
                Country = await _repository.CreateOrUpdateAsync(Country, userId);

                if (Country?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<CountryModel>(Country);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<CountryModel>> UpdateAsync(CountryModel entity, Guid userId)
        {
            GenericResponse<CountryModel> result = new();
            var Country = await _repository.GetByIdAsync(entity.Id);
            if (null != Country)
            {
                Country = _mapper.Map(entity, Country);
                Country = await _repository.CreateOrUpdateAsync(Country, userId);
                if (Country?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<CountryModel>(Country);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task DeleteAsync(int id, Guid userId)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                entity.Status = BaseEntityStatus.Deleted;
                await _repository.CreateOrUpdateAsync(entity, userId);
            }

            _session.GetUnitOfWork().CommitChanges();
        }
    }
}
