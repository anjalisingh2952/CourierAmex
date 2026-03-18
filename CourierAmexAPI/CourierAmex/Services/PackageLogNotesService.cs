using AutoMapper;
using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;
using Entities = CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class PackageLogNotesService : IPackageLogNotesService
    {
        private readonly IPackageLogNotesRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public PackageLogNotesService(IMapper mapper, IPackageLogNotesRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<PagedResponse<PackageLogNotesModel>> GetByNumeroByClienteAsync(int? numero, string codigoCliente)
        {
            PagedResponse<PackageLogNotesModel>? response = new();
            
            var entities = await _repository.GetByNumeroByClienteAsync(numero, codigoCliente);
            if (null != entities)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<PackageLogNotesModel>>(entities);
                response.TotalRows = entities.Count();
            }


            return response;
        }

        public async Task<PagedResponse<PackageLogNotesModel>> GetPagedAsync(FilterByRequest request, string codigoCliente, int numeroPckg = 0)
        {
            PagedResponse<PackageLogNotesModel> result = new();
            var sort = request.SortBy ?? "Name ASC";
            var criteria = request.Criteria ?? "";

            var entities = await _repository.GetPagedAsync(request.PageSize, request.PageIndex, sort, criteria, codigoCliente, numeroPckg );
            if (null != entities)
            {
                result.Success = true;
                result.Data = _mapper.Map<List<PackageLogNotesModel>>(entities);
                var entity = entities.FirstOrDefault();
                result.TotalRows = entity != null ? entity.TotalRows : 0;
            }

            return result;
        }

        public async Task<GenericResponse<PackageLogNotesModel>> CreateAsync(PackageLogNotesModel entity, Guid userId)
        {
            GenericResponse<PackageLogNotesModel> result = new();
            var PackageLogNotes = _mapper.Map<Entities.PackageLogNotes>(entity);
            if (null != PackageLogNotes)
            {
                PackageLogNotes = await _repository.CreateOrUpdateAsync(PackageLogNotes, userId);

                if (PackageLogNotes?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PackageLogNotesModel>(PackageLogNotes);
                }
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }

        public async Task<GenericResponse<PackageLogNotesModel>> UpdateAsync(PackageLogNotesModel entity, Guid userId)
        {
            GenericResponse<PackageLogNotesModel> result = new();
            var PaymentType = await _repository.GetByIdAsync(entity.Id);
            if (null != PaymentType)
            {
                PaymentType = _mapper.Map(entity, PaymentType);
                PaymentType = await _repository.CreateOrUpdateAsync(PaymentType, userId);
                if (PaymentType?.Id.ToString().Length > 0)
                {
                    result.Success = true;
                    result.Data = _mapper.Map<PackageLogNotesModel>(PaymentType);
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
