using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

using Entities = CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Http;

namespace CourierAmex.Services
{
    public class BankService : IBankService
    {
        private readonly IBankRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;


        public BankService(IMapper mapper, IBankRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _repository = repository;
            _session = session;
        }
        public async Task<GenericResponse<IEnumerable<BankModel>>> GetByCompanyAsync(int companyId = 0)
        {
            GenericResponse<IEnumerable<BankModel>>? response = new();
            var entity = await _repository.GetByCompanyAsync(companyId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<IEnumerable<BankModel>>(entity);
            }

            return response;
        }

        public async Task<GenericResponse<IEnumerable<BrandModel>>> GetBrandByCompanyAsync(int companyId = 0)
        {
            GenericResponse<IEnumerable<BrandModel>>? response = new();
            var entity = await _repository.GetBrandByCompanyAsync(companyId);
            if (null != entity)
            {
                response.Success = true;
                response.Data = _mapper.Map<IEnumerable<BrandModel>>(entity);
            }

            return response;
        }


    }

}
