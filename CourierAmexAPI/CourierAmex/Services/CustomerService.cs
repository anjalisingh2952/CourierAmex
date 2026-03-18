using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public CustomerService(IMapper mapper, ICustomerRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<IEnumerable<CustomerModel>>> GetAllActiveAsync()
        {
            GenericResponse<IEnumerable<CustomerModel>>? response = new();
            var entity = await _repository.GetAllAsync();
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<IEnumerable<CustomerModel>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<CustomerModel>> GetByIdAsync(long id)
        {
            GenericResponse<CustomerModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<CustomerModel>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<CustomerModel>> GetByCodeAsync(string id)
        {
            GenericResponse<CustomerModel>? response = new();
            var entity = await _repository.GetByCodeAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<CustomerModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<CustomerModel>> GetPagedAsync(int companyId, FilterByRequest request)
        {
            PagedResponse<CustomerModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(companyId, request.PageSize, request.PageIndex, sort, criteria);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<CustomerModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<CustomerModel>> CreateAsync(CustomerModel entity, Guid userId)
        {
            GenericResponse<CustomerModel> result = new();
            var Customer = _mapper.Map<Entities.Customer>(entity);
            if (null != Customer)
            {
                Customer = await _repository.CreateOrUpdateAsync(Customer, userId);

                if (Customer?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<CustomerModel>(Customer);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<CustomerModel>> UpdateAsync(CustomerModel entity, Guid userId)
        {
            GenericResponse<CustomerModel> result = new();
            var Customer = await _repository.GetByIdAsync(entity.Id);
            if (null != Customer)
            {
                Customer = _mapper.Map(entity, Customer);
                Customer = await _repository.CreateOrUpdateAsync(Customer, userId);
                if (Customer?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<CustomerModel>(Customer);
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


        public async Task<GenericResponse<IEnumerable<CustomerCreditModel>>> GetEnabledCreditsAsync(string? filter, int companyId)
        {
            var response = new GenericResponse<IEnumerable<CustomerCreditModel>>();

            // Call repository method that executes your stored procedure
            var entities = await _repository.GetEnabledCreditsAsync(filter ?? "", companyId);

            if (entities != null)
            {
                response.Success = true;
                response.Data = _mapper.Map<IEnumerable<CustomerCreditModel>>(entities);
            }
            else
            {
                response.Success = false;
                response.Message = "No customer credit records found.";
            }

            return response;
        }

        public async Task<GenericResponse<string>> EnableCustomerCreditAsync(string customerCode, int companyId)
        {
            var response = new GenericResponse<string>();

            var result = await _repository.EnableCustomerCreditAsync(customerCode, companyId);

            if (result > 0)
            {
                response.Success = true;
                response.Data = "Credit enabled successfully.";
            }
            else
            {
                response.Success = false;
                response.Message = "Failed to enable credit.";
            }

            return response;
        }


        public async Task<GenericResponse<IEnumerable<CustomerCreditModel>>> GetEnabledCustomerCreditsAsync(int companyId)
        {
            var response = new GenericResponse<IEnumerable<CustomerCreditModel>>();
            var data = await _repository.GetEnabledCustomerCreditsAsync(companyId);

            response.Success = true;
            response.Data = data;

            return response;
        }



        public async Task<GenericResponse<string>> DisableCustomerCreditAsync(string customerCode, int companyId)
        {
            var response = new GenericResponse<string>();

            var success = await _repository.DisableCustomerCreditAsync(customerCode, companyId);
            
                response.Success = true;
                response.Data = "Customer credit disabled successfully.";

            return response;
        }



    }
}
