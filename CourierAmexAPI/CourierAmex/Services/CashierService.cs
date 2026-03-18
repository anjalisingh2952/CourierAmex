using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;
using Microsoft.IdentityModel.Tokens;

namespace CourierAmex.Services
{
    public class CashierService : ICashierService
    {
        private readonly ICashierRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public CashierService(IMapper mapper, ICashierRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<IEnumerable<CashierModel>>> GetAllActiveAsync()
        {
            GenericResponse<IEnumerable<CashierModel>>? response = new();
            var entity = await _repository.GetAllAsync();
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<IEnumerable<CashierModel>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<CashierModel>> GetByIdAsync(int id)
        {
            GenericResponse<CashierModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<CashierModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<CashierModel>> GetPagedAsync(FilterByRequest request, int countryId = 0)
        {
            PagedResponse<CashierModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, countryId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<CashierModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<CashierModel>> CreateAsync(CashierModel entity, Guid userId)
        {
            GenericResponse<CashierModel> result = new();
            var cashier = _mapper.Map<Entities.Cashier>(entity);
            if (null != cashier)
            {
                cashier = await _repository.CreateOrUpdateAsync(cashier, userId);

                if (cashier?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<CashierModel>(cashier);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<List<UserByPointOfSaleModel>> GetUserByPointOfSale(int companyId, int pointOfSaleId)
        {
            List<UserByPointOfSaleModel> result = new();
            {
                var cashier = await _repository.GetUserByPointOfSaleAsync(companyId,pointOfSaleId);

                if (!cashier.IsNullOrEmpty())
                {
                    result = _mapper.Map<List<UserByPointOfSaleModel>>(cashier);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<CashierModel>> UpdateAsync(CashierModel entity, Guid userId)
        {
            GenericResponse<CashierModel> result = new();
            var Company = await _repository.GetByIdAsync(entity.Id);
            if (null != Company)
            {
                Company = _mapper.Map(entity, Company);
                Company = await _repository.CreateOrUpdateAsync(Company, userId);
                if (Company?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<CashierModel>(Company);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<bool>> InsertUserToCashier(int companyId, int pointOfSaleId, string userName)
        {
            GenericResponse<bool> result = new();
            var exist = await _repository.InsertUserToCashierAsync(companyId,pointOfSaleId,userName);
            if (null != exist)
            {
                {
                    result.Success = true;
                    result.Data = _mapper.Map<bool>(exist);
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
                entity.Status = 1;//BaseEntityStatus.Deleted;
                await _repository.CreateOrUpdateAsync(entity, userId);
            }

            _session.GetUnitOfWork().CommitChanges();
        }
    }
}
