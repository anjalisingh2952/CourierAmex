using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Http;

namespace CourierAmex.Services
{
    public class TemplateService:ITemplateService
    {
        private readonly ITemplateRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public TemplateService(IMapper mapper, ITemplateRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<IEnumerable<TemplateModel>> GetByCompanyModuleAsync(string moduleId, int companyId = 0)
        {
            IEnumerable<TemplateModel> response = new List<TemplateModel>();

            var entity = await _repository.GetByCompanyModuleAsync(companyId, moduleId);
            if (null != entity)
            {
                response = _mapper.Map<IEnumerable<TemplateModel>>(entity);
            }

            return response;
        }

    }
}
