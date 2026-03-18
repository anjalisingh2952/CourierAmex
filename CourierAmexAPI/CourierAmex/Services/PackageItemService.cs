using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;
//using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class PackageItemService : IPackageItemService
    {
        private readonly IPackageItemRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public PackageItemService(IMapper mapper, IPackageItemRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<PackageItemModel>> GetByIdAsync(int id)
        {
            GenericResponse<PackageItemModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<PackageItemModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<PackageItemModel>> GetPagedAsync(FilterByRequest request, int P_number)
        {
            PagedResponse<PackageItemModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, P_number);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PackageItemModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<PackageItemModel>> CreateAsync(PackageItemModel entity, Guid userId)
        {
            GenericResponse<PackageItemModel> result = new();
            var package = _mapper.Map<Entities.PackageItem>(entity);
            if (null != package)
            {
                package = await _repository.CreateOrUpdateAsync(package);

                if (package?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PackageItemModel>(package);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<PackageItemModel>> UpdateAsync(PackageItemModel entity, Guid userId)
        {
            GenericResponse<PackageItemModel> result = new();
            var Package = await _repository.GetByIdAsync(entity.Id);
            if (null != Package)
            {
                Package = _mapper.Map(entity, Package);
                Package = await _repository.CreateOrUpdateAsync(Package);
                if (Package?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PackageItemModel>(Package);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<bool>> DeleteAsync(int id, Guid userId)
        {
            GenericResponse<bool> result = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                var deleteId = 0;//await _repository.ValidateDeleteAsync(entity.Id);
                if (deleteId == 0)
                {
                    entity.Status = BaseEntityStatus.Deleted;
                    //await _repository.CreateOrUpdateAsync(entity, userId);
                    result.Success = true;
                }
                else
                {
                    result.Success = false;
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<PagedResponse<PackageItemModel_PreviousReport_PreStudy>> GetPackageItems_PreStudyAsync(FilterByRequest request, string manifestNumber, string packageNumbers, int companyid)
        {
            PagedResponse<PackageItemModel_PreviousReport_PreStudy> result = new();
            var entities = await _repository.GetPaged_PackageItems_PreStudy_Async(request.PageSize, request.PageIndex, request.SortBy ?? "", request.Criteria ?? "", manifestNumber, packageNumbers, companyid);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PackageItemModel_PreviousReport_PreStudy>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<int>> UpdateBillingDetailsAsync(PackageItemModel_PreviousReport_PreStudy entity, Guid userId)
        {
            GenericResponse<int> result = new();
            
            if (null != entity)
            {
                if (entity?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = await _repository.UpdateBillingDetails(entity, userId) ?? 0;
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

    }
}
