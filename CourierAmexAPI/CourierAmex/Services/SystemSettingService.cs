using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class SystemSettingService : ISystemSettingService
    {
        private readonly ISystemSettingRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public SystemSettingService(IMapper mapper, ISystemSettingRepository repository, IDalSession session, JwtAuthService jwtAuthService)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<IEnumerable<SystemSettingModel>>> GetAllAsync()
        {
            GenericResponse<IEnumerable<SystemSettingModel>> response = new();
            var entity = await _repository.GetAllAsync();
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<List<SystemSettingModel>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<bool>> BulkUpdateAsync(IEnumerable<SystemSettingModel> entities, Guid userId)
        {
            GenericResponse<bool> result = new();
            
            var list = _mapper.Map<IEnumerable<Entities.SystemSetting>>(entities);
            if (list.Any())
            {
                await _repository.BulkUpdateAsync(list, userId);
                result.Success = true;
            }

            _session.GetUnitOfWork().CommitChanges();

            return result;
        }
        
        
    }
}
