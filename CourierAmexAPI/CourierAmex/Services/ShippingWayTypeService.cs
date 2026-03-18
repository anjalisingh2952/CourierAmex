using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class ShippingWayTypeService : IShippingWayTypeService
    {
        private readonly IShippingWayTypeRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public ShippingWayTypeService(IMapper mapper, IShippingWayTypeRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<ShippingWayTypeModel>> GetByIdAsync(int id)
        {
            GenericResponse<ShippingWayTypeModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<ShippingWayTypeModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<ShippingWayTypeModel>> GetPagedAsync(FilterByRequest request)
        {
            PagedResponse<ShippingWayTypeModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<ShippingWayTypeModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<ShippingWayTypeModel>> CreateAsync(ShippingWayTypeModel entity, Guid userId)
        {
            GenericResponse<ShippingWayTypeModel> result = new();
            var ShippingWayType = _mapper.Map<Entities.ShippingWayType>(entity);
            if (null != ShippingWayType)
            {
                ShippingWayType = await _repository.CreateOrUpdateAsync(ShippingWayType, userId);

                if (ShippingWayType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<ShippingWayTypeModel>(ShippingWayType);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<ShippingWayTypeModel>> UpdateAsync(ShippingWayTypeModel entity, Guid userId)
        {
            GenericResponse<ShippingWayTypeModel> result = new();
            var ShippingWayType = await _repository.GetByIdAsync(entity.Id);
            if (null != ShippingWayType)
            {
                ShippingWayType = _mapper.Map(entity, ShippingWayType);
                ShippingWayType = await _repository.CreateOrUpdateAsync(ShippingWayType, userId);
                if (ShippingWayType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<ShippingWayTypeModel>(ShippingWayType);
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
