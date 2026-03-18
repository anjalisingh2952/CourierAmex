using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class StateService : IStateService
    {
        private readonly IStateRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public StateService(IMapper mapper, IStateRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<StateModel>> GetByIdAsync(int id)
        {
            GenericResponse<StateModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<StateModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<StateModel>> GetPagedAsync(FilterByRequest request, int countryId = 0)
        {
            PagedResponse<StateModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, countryId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<StateModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<StateModel>> CreateAsync(StateModel entity, Guid userId)
        {
            GenericResponse<StateModel> result = new();
            var State = _mapper.Map<Entities.State>(entity);
            if (null != State)
            {
                State = await _repository.CreateOrUpdateAsync(State, userId);

                if (State?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<StateModel>(State);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<StateModel>> UpdateAsync(StateModel entity, Guid userId)
        {
            GenericResponse<StateModel> result = new();
            var State = await _repository.GetByIdAsync(entity.Id);
            if (null != State)
            {
                State = _mapper.Map(entity, State);
                State = await _repository.CreateOrUpdateAsync(State, userId);
                if (State?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<StateModel>(State);
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
