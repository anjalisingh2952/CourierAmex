using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Http;

namespace CourierAmex.Services
{
    public class ModuleService:IModuleService
    {
        private readonly IModuleRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public ModuleService(IMapper mapper, IModuleRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }
        public async Task<IEnumerable<ModuleModel>> GetByCompanyAsync(int companyId = 0)
        {
            IEnumerable<ModuleModel> response = new List<ModuleModel>();

            var entity = await _repository.GetByCompanyAsync(companyId);
            if (null != entity)
            {
                response = _mapper.Map<IEnumerable<ModuleModel>>(entity);
            }

            return response;
        }

    }
}
