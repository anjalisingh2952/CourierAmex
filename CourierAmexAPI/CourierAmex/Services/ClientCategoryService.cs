using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class ClientCategoryService : IClientCategoryService
    {
        private readonly IClientCategoryRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public ClientCategoryService(IMapper mapper, IClientCategoryRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<ClientCategoryModel>> GetByIdAsync(byte id)
        {
            GenericResponse<ClientCategoryModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<ClientCategoryModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<ClientCategoryModel>> GetPagedAsync(FilterByRequest request, int companyId = 0)
        {
            PagedResponse<ClientCategoryModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, companyId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<ClientCategoryModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<ClientCategoryModel>> CreateAsync(ClientCategoryModel entity, Guid userId)
        {
            GenericResponse<ClientCategoryModel> result = new();
            var ClientCategory = _mapper.Map<Entities.ClientCategory>(entity);
            if (null != ClientCategory)
            {
                ClientCategory = await _repository.CreateOrUpdateAsync(ClientCategory, userId);

                if (ClientCategory?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<ClientCategoryModel>(ClientCategory);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<ClientCategoryModel>> UpdateAsync(ClientCategoryModel entity, Guid userId)
        {
            GenericResponse<ClientCategoryModel> result = new();
            var ClientCategory = await _repository.GetByIdAsync(entity.Id);
            if (null != ClientCategory)
            {
                ClientCategory = _mapper.Map(entity, ClientCategory);
                ClientCategory = await _repository.CreateOrUpdateAsync(ClientCategory, userId);
                if (ClientCategory?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<ClientCategoryModel>(ClientCategory);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task DeleteAsync(byte id, Guid userId)
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
