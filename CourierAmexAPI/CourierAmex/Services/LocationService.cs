using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class LocationService : ILocationService
    {
        private readonly ILocationRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public LocationService(IMapper mapper, ILocationRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<IEnumerable<LocationModel>> GetByCompanyAsync(int companyId, int supplierId = 0)
        {
            var entities = await _repository.GetByCompanyAsync(companyId, supplierId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<LocationModel>>(entities);
            }

            return new List<LocationModel>();
        }

        public async Task<GenericResponse<LocationModel>> GetByIdAsync(int id)
        {
            GenericResponse<LocationModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<LocationModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<LocationModel>> GetPagedAsync(FilterByRequest request, int companyId = 0)
        {
            PagedResponse<LocationModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, companyId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<LocationModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<LocationModel>> CreateAsync(LocationModel entity, Guid userId)
        {
            GenericResponse<LocationModel> result = new();
            var Location = _mapper.Map<Entities.Location>(entity);
            if (null != Location)
            {
                Location = await _repository.CreateOrUpdateAsync(Location, userId);

                if (Location?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<LocationModel>(Location);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<LocationModel>> UpdateAsync(LocationModel entity, Guid userId)
        {
            GenericResponse<LocationModel> result = new();
            var Location = await _repository.GetByIdAsync(entity.Id);
            if (null != Location)
            {
                Location = _mapper.Map(entity, Location);
                Location = await _repository.CreateOrUpdateAsync(Location, userId);
                if (Location?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<LocationModel>(Location);
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
