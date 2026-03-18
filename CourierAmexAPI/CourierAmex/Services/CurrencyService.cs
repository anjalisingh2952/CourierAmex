using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public class CurrencyService: ICurrencyService
    {
        private readonly ICurrencyRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public CurrencyService(IMapper mapper, ICurrencyRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }

        public async Task<GenericResponse<IEnumerable<Currency>>> GetByCompanyAsync(int companyId = 0)
        {
            GenericResponse<IEnumerable<Currency>>? response = new();
            var entity = await _repository.GetByCompanyAsync(companyId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<IEnumerable<Currency>>(entity);
            }

            return response;
        }

    }
}
