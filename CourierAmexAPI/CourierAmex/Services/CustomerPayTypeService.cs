using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class CustomerPayTypeService : ICustomerPayTypeService
    {
        private readonly ICustomerPayTypeRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public CustomerPayTypeService(IMapper mapper, ICustomerPayTypeRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<CustomerPayTypeModel>> GetByIdAsync(int id)
        {
            GenericResponse<CustomerPayTypeModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<CustomerPayTypeModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<CustomerPayTypeModel>> GetPagedAsync(FilterByRequest request, int companyId)
        {
            PagedResponse<CustomerPayTypeModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, companyId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<CustomerPayTypeModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<CustomerPayTypeModel>> CreateAsync(CustomerPayTypeModel entity, Guid userId)
        {
            GenericResponse<CustomerPayTypeModel> result = new();
            var CustomerPayType = _mapper.Map<Entities.CustomerPayType>(entity);
            if (null != CustomerPayType)
            {
                CustomerPayType = await _repository.CreateOrUpdateAsync(CustomerPayType, userId);

                if (CustomerPayType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<CustomerPayTypeModel>(CustomerPayType);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<CustomerPayTypeModel>> UpdateAsync(CustomerPayTypeModel entity, Guid userId)
        {
            GenericResponse<CustomerPayTypeModel> result = new();
            var CustomerPayType = await _repository.GetByIdAsync(entity.Id);
            if (null != CustomerPayType)
            {
                CustomerPayType = _mapper.Map(entity, CustomerPayType);
                CustomerPayType = await _repository.CreateOrUpdateAsync(CustomerPayType, userId);
                if (CustomerPayType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<CustomerPayTypeModel>(CustomerPayType);
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
