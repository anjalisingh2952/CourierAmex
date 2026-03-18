using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class AreaService : IAreaService
    {
        private readonly IAreaRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public AreaService(IMapper mapper, IAreaRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<AreaModel>> GetByIdAsync(int id)
        {
            GenericResponse<AreaModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<AreaModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<AreaModel>> GetPagedAsync(FilterByRequest request, int countryId = 0, int stateId = 0, int zoneId = 0)
        {
            PagedResponse<AreaModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, countryId, stateId, zoneId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<AreaModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<AreaModel>> CreateAsync(AreaModel entity, Guid userId)
        {
            GenericResponse<AreaModel> result = new();
            var Area = _mapper.Map<Entities.Area>(entity);
            if (null != Area)
            {
                Area = await _repository.CreateOrUpdateAsync(Area, userId);

                if (Area?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<AreaModel>(Area);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<AreaModel>> UpdateAsync(AreaModel entity, Guid userId)
        {
            GenericResponse<AreaModel> result = new();
            var Area = await _repository.GetByIdAsync(entity.Id);
            if (null != Area)
            {
                Area = _mapper.Map(entity, Area);
                Area = await _repository.CreateOrUpdateAsync(Area, userId);
                if (Area?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<AreaModel>(Area);
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
