using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class ZoneService : IZoneService
    {
        private readonly IZoneRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public ZoneService(IMapper mapper, IZoneRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<ZoneModel>> GetByIdAsync(int id)
        {
            GenericResponse<ZoneModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<ZoneModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<ZoneModel>> GetPagedAsync(FilterByRequest request, int countryId = 0, int stateId = 0)
        {
            PagedResponse<ZoneModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, countryId, stateId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<ZoneModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<ZoneModel>> CreateAsync(ZoneModel entity, Guid userId)
        {
            GenericResponse<ZoneModel> result = new();
            var Zone = _mapper.Map<Entities.Zone>(entity);
            if (null != Zone)
            {
                Zone = await _repository.CreateOrUpdateAsync(Zone, userId);

                if (Zone?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<ZoneModel>(Zone);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<ZoneModel>> UpdateAsync(ZoneModel entity, Guid userId)
        {
            GenericResponse<ZoneModel> result = new();
            var Zone = await _repository.GetByIdAsync(entity.Id);
            if (null != Zone)
            {
                Zone = _mapper.Map(entity, Zone);
                Zone = await _repository.CreateOrUpdateAsync(Zone, userId);
                if (Zone?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<ZoneModel>(Zone);
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
