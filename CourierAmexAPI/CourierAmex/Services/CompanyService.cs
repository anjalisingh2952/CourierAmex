using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public CompanyService(IMapper mapper, ICompanyRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<IEnumerable<CompanyModel>>> GetAllActiveAsync()
        {
            GenericResponse<IEnumerable<CompanyModel>>? response = new();
            var entity = await _repository.GetAllAsync();
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<IEnumerable<CompanyModel>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<CompanyModel>> GetByIdAsync(int id)
        {
            GenericResponse<CompanyModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<CompanyModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<CompanyModel>> GetPagedAsync(FilterByRequest request, int countryId = 0)
        {
            PagedResponse<CompanyModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, countryId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<CompanyModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<CompanyModel>> CreateAsync(CompanyModel entity, Guid userId)
        {
            GenericResponse<CompanyModel> result = new();
            var Company = _mapper.Map<Entities.Company>(entity);
            if (null != Company)
            {
                Company = await _repository.CreateOrUpdateAsync(Company, userId);

                if (Company?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<CompanyModel>(Company);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<CompanyModel>> UpdateAsync(CompanyModel entity, Guid userId)
        {
            GenericResponse<CompanyModel> result = new();
            var Company = await _repository.GetByIdAsync(entity.Id);
            if (null != Company)
            {
                Company = _mapper.Map(entity, Company);
                Company = await _repository.CreateOrUpdateAsync(Company, userId);
                if (Company?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<CompanyModel>(Company);
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

        public async Task<GenericResponse<CompanyAttachmentUrl>> GetAttachmentUrlByCompanyIdAsync(int companyId)
        {
            var response = new GenericResponse<CompanyAttachmentUrl>();

            var result = await _repository.GetAttachmentUrlByCompanyIdAsync(companyId);

            if (result != null && !string.IsNullOrEmpty(result.AttachmentUrl))
            {
                response.Success = true;
                response.Data = result;
            }
            else
            {
                response.Success = false;
                response.Message = "Attachment URL not found.";
            }

            return response;
        }


    }
}
