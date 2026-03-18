using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class SupplierService : ISupplierService
    {
        private readonly ISupplierRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public SupplierService(IMapper mapper, ISupplierRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<IEnumerable<SupplierModel>> GetByCompanyAsync(int companyId)
        {
            var entities = await _repository.GetByCompanyAsync(companyId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<SupplierModel>>(entities);
            }

            return new List<SupplierModel>();
        }

        public async Task<GenericResponse<SupplierModel>> GetByIdAsync(int id)
        {
            GenericResponse<SupplierModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<SupplierModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<SupplierModel>> GetPagedAsync(FilterByRequest request, int companyId = 0)
        {
            PagedResponse<SupplierModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, companyId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<SupplierModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<SupplierModel>> CreateAsync(SupplierModel entity, Guid userId)
        {
            GenericResponse<SupplierModel> result = new();
            var Supplier = _mapper.Map<Entities.Supplier>(entity);
            if (null != Supplier)
            {
                Supplier = await _repository.CreateOrUpdateAsync(Supplier, userId);

                if (Supplier?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<SupplierModel>(Supplier);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<SupplierModel>> UpdateAsync(SupplierModel entity, Guid userId)
        {
            GenericResponse<SupplierModel> result = new();
            var Supplier = await _repository.GetByIdAsync(entity.Id);
            if (null != Supplier)
            {
                Supplier = _mapper.Map(entity, Supplier);
                Supplier = await _repository.CreateOrUpdateAsync(Supplier, userId);
                if (Supplier?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<SupplierModel>(Supplier);
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


        public async Task<GenericResponse<List<PurchaseReport>>> GetPurchasesReportAsync(DateTime startDate, DateTime endDate, int companyId)
        {
            var response = new GenericResponse<List<PurchaseReport>>();

            try
            {
                var parameters = new
                {
                    StartDate = startDate,
                    EndDate = endDate,
                    CompanyId = companyId
                };

                var reportData = await _repository.GetPurchasesReportAsync(startDate, endDate, companyId);

                if (reportData == null || !reportData.Any())
                {
                    response.Success = false;
                    response.Message = "No data found for the selected date range.";
                    response.Data = new List<PurchaseReport>();
                }
                else
                {
                    response.Success = true;
                    response.Data = _mapper.Map<List<PurchaseReport>>(reportData);
                }
            }
            catch (Exception ex)
            {
                response.Success = false;
                response.Message = $"An error occurred: {ex.Message}";
                response.Data = new List<PurchaseReport>();
            }

            return response;
        }



    }
}
