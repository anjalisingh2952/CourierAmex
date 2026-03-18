using AutoMapper;
using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;
using CourierAmex.Services.Interfaces;
using Dapper;
using Entities = CourierAmex.Storage.Domain;



namespace CourierAmex.Services
{
    public class PackageNotesService : IPackageNotesService
    {
        private readonly IPackageNotesRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;
        public PackageNotesService(IMapper mapper, IPackageNotesRepository repository, IDalSession session )
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<PackageNotesModel>> GetByIdAsync(int id)
        {
            GenericResponse<PackageNotesModel>? response = new();
            var entity = await _repository.GetByIdAsync(id);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<PackageNotesModel>(entity);
            }
            return response;
        }
        public async Task<GenericResponse<PackageNotesModel>> CreateAsync(PackageNotesModel entity, Guid userId)
        {
            GenericResponse<PackageNotesModel> result = new();
            var PackageNotes = _mapper.Map<Entities.PackageNotes>(entity);
            PackageNotes.Status = BaseEntityStatus.Active;
            if (null != PackageNotes)
            {
                PackageNotes = await _repository.CreateOrUpdateAsync(PackageNotes, userId);
                if (PackageNotes?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PackageNotesModel>(PackageNotes);
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

        public Task<PagedResponse<PackageNotesModel>> GetByNumeroByClienteAsync(int? numero, string codigoCliente)
        {
            throw new NotImplementedException();
        }

        public async Task<PagedResponse<PackageNotesModel>> GetPagedAsync(FilterByRequest request, int companyId, string codigoCliente = "", string numeroCourier = "")
        {
            PagedResponse<PackageNotesModel> result = new();
            var sort = request.SortBy ?? "Message ASC";
            var criteria = request.Criteria ?? "";
            var entities = await _repository.GetPagedAsync(request.PageSize,  request.PageIndex, sort, criteria, codigoCliente, numeroCourier, companyId);
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PackageNotesModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }
            return result;
        }

        public Task<GenericResponse<PackageNotesModel>> UpdateAsync(PackageNotesModel entity, Guid userId)
        {
            throw new NotImplementedException();
        }

        Task<PagedResponse<PackageNotesModel>> IPackageNotesService.GetByNumeroByClienteAsync(int? numero, string codigoCliente)
        {
            throw new NotImplementedException();
        }
    }
}
