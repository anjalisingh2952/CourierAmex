using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class RoleService : IRoleService
    {
        private readonly IRoleRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public RoleService(IMapper mapper, IRoleRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<IEnumerable<RoleModel>> GetAllActiveAsync(int companyId)
        {
            var entities = await _repository.GetAllActiveAsync(companyId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<RoleModel>>(entities);
            }

            return new List<RoleModel>();
        }

        public async Task<GenericResponse<RoleModel>> GetByIdAsync(string id)
        {
            GenericResponse<RoleModel>? response = new();
            var entity = await _repository.GetByIdAsync(Guid.Parse(id));
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<RoleModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<RoleModel>> GetPagedAsync(FilterByRequest request)
        {
            PagedResponse<RoleModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";
            var companyId = request.CompanyId ?? 0;

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, companyId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<RoleModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<RoleModel>> CreateAsync(RoleModel entity, Guid userId)
        {
            GenericResponse<RoleModel> result = new();
            var role = _mapper.Map<Entities.Role>(entity);
            if (null != role)
            {
                role = await _repository.CreateOrUpdateAsync(role, userId);

                if (role?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<RoleModel>(role);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<RoleModel>> UpdateAsync(RoleModel entity, Guid userId)
        {
            GenericResponse<RoleModel> result = new();
            var role = await _repository.GetByIdAsync(Guid.Parse(entity.Id));
            if (null != role)
            {
                role = _mapper.Map(entity, role);
                role = await _repository.CreateOrUpdateAsync(role, userId);
                if (role?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<RoleModel>(role);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task DeleteAsync(string id, Guid userId)
        {
            var entity = await _repository.GetByIdAsync(Guid.Parse(id));
            if (null != entity)
            {
                entity.Status = BaseEntityStatus.Deleted;
                await _repository.CreateOrUpdateAsync(entity, userId);
            }

            _session.GetUnitOfWork().CommitChanges();
        }
    }
}
