using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class DocumentPayTypeService : IDocumentPayTypeService
    {
        private readonly IDocumentPayTypeRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public DocumentPayTypeService(IMapper mapper, IDocumentPayTypeRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<DocumentPayTypeModel>> GetByIdAsync(int id)
        {
            GenericResponse<DocumentPayTypeModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<DocumentPayTypeModel>(entity);
            }

            return response;
        }
        public async Task<PagedResponse<DocumentPayTypeModel>> GetPagedAsync(FilterByRequest request, int companyId)
        {
            PagedResponse<DocumentPayTypeModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, companyId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<DocumentPayTypeModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<DocumentPayTypeModel>> CreateAsync(DocumentPayTypeModel entity, Guid userId)
        {
            GenericResponse<DocumentPayTypeModel> result = new();
            var DocumentPayType = _mapper.Map<Entities.DocumentPayType>(entity);
            if (null != DocumentPayType)
            {
                DocumentPayType = await _repository.CreateOrUpdateAsync(DocumentPayType, userId);

                if (DocumentPayType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<DocumentPayTypeModel>(DocumentPayType);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<DocumentPayTypeModel>> UpdateAsync(DocumentPayTypeModel entity, Guid userId)
        {
            GenericResponse<DocumentPayTypeModel> result = new();
            var DocumentPayType = await _repository.GetByIdAsync(entity.Id);
            if (null != DocumentPayType)
            {
                DocumentPayType = _mapper.Map(entity, DocumentPayType);
                DocumentPayType = await _repository.CreateOrUpdateAsync(DocumentPayType, userId);
                if (DocumentPayType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<DocumentPayTypeModel>(DocumentPayType);
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
