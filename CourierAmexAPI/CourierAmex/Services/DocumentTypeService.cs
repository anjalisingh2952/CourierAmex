using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class DocumentTypeService : IDocumentTypeService
    {
        private readonly IDocumentTypeRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public DocumentTypeService(IMapper mapper, IDocumentTypeRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<DocumentTypeModel>> GetByIdAsync(int id)
        {
            GenericResponse<DocumentTypeModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<DocumentTypeModel>(entity);
            }

            return response;
        }

        public async Task<PagedResponse<DocumentTypeModel>> GetPagedAsync(FilterByRequest request, int companyId = 0)
        {
            PagedResponse<DocumentTypeModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, companyId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<DocumentTypeModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<DocumentTypeModel>> CreateAsync(DocumentTypeModel entity, Guid userId)
        {
            GenericResponse<DocumentTypeModel> result = new();
            var DocumentType = _mapper.Map<Entities.DocumentType>(entity);
            if (null != DocumentType)
            {
                DocumentType = await _repository.CreateOrUpdateAsync(DocumentType, userId);

                if (DocumentType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<DocumentTypeModel>(DocumentType);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<DocumentTypeModel>> UpdateAsync(DocumentTypeModel entity, Guid userId)
        {
            GenericResponse<DocumentTypeModel> result = new();
            var DocumentType = await _repository.GetByIdAsync(entity.Id);
            if (null != DocumentType)
            {
                DocumentType = _mapper.Map(entity, DocumentType);
                DocumentType = await _repository.CreateOrUpdateAsync(DocumentType, userId);
                if (DocumentType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<DocumentTypeModel>(DocumentType);
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
