using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class PackageStatusService : IPackageStatusService
    {
        private readonly IPackageStatusRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public PackageStatusService(IMapper mapper, IPackageStatusRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<PackageStatusModel>> GetByIdAsync(int id)
        {
            GenericResponse<PackageStatusModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<PackageStatusModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<PackageStatusModel>> GetPagedAsync(FilterByRequest request)
        {
            PagedResponse<PackageStatusModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PackageStatusModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<PackageStatusModel>> CreateAsync(PackageStatusModel entity, Guid userId)
        {
            GenericResponse<PackageStatusModel> result = new();
            var PackageStatus = _mapper.Map<Entities.PackageStatus>(entity);
            if (null != PackageStatus)
            {
                PackageStatus = await _repository.CreateOrUpdateAsync(PackageStatus, userId);

                if (PackageStatus?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PackageStatusModel>(PackageStatus);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<PackageStatusModel>> UpdateAsync(PackageStatusModel entity, Guid userId)
        {
            GenericResponse<PackageStatusModel> result = new();
            var PackageStatus = await _repository.GetByIdAsync(entity.Id);
            if (null != PackageStatus)
            {
                PackageStatus = _mapper.Map(entity, PackageStatus);
                PackageStatus = await _repository.CreateOrUpdateAsync(PackageStatus, userId);
                if (PackageStatus?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PackageStatusModel>(PackageStatus);
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
                entity.Code = @$"DNU-{entity.Code}";
                entity.Status = BaseEntityStatus.Deleted;
                await _repository.CreateOrUpdateAsync(entity, userId);
            }

            _session.GetUnitOfWork().CommitChanges();
        }
    }
}
