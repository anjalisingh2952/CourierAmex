using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;
using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class PaymentTypeService : IPaymentTypeService
    {
        private readonly IPaymentTypeRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public PaymentTypeService(IMapper mapper, IPaymentTypeRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<PaymentTypeModel>> GetByIdAsync(int id)
        {
            GenericResponse<PaymentTypeModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<PaymentTypeModel>(entity);
            }


            return response;
        }

        public async Task<PagedResponse<PaymentTypeModel>> GetPagedAsync(FilterByRequest request, int companyId)
        {
            PagedResponse<PaymentTypeModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, companyId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PaymentTypeModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<PaymentTypeModel>> CreateAsync(PaymentTypeModel entity, Guid userId)
        {
            GenericResponse<PaymentTypeModel> result = new();
            var PaymentType = _mapper.Map<Entities.PaymentType>(entity);
            if (null != PaymentType)
            {
                PaymentType = await _repository.CreateOrUpdateAsync(PaymentType, userId);

                if (PaymentType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PaymentTypeModel>(PaymentType);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<PaymentTypeModel>> UpdateAsync(PaymentTypeModel entity, Guid userId)
        {
            GenericResponse<PaymentTypeModel> result = new();
            var PaymentType = await _repository.GetByIdAsync(entity.Id);
            if (null != PaymentType)
            {
                PaymentType = _mapper.Map(entity, PaymentType);
                PaymentType = await _repository.CreateOrUpdateAsync(PaymentType, userId);
                if (PaymentType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PaymentTypeModel>(PaymentType);
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
