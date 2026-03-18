using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

namespace CourierAmex.Services
{
    public class ProductService : IProductService
    {
        private readonly IProductRepository _repository;
        private readonly IDalSession _session;
        private readonly IMapper _mapper;

        public ProductService(IMapper mapper, IProductRepository repository, IDalSession session)
        {
            _mapper = mapper;
            _session = session;
            _repository = repository;
        }

        public async Task<IEnumerable<ProductModel>> GetByCompanyAsync(int companyId)
        {
            var entities = await _repository.GetByCompanyAsync(companyId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<ProductModel>>(entities);
            }

            return new List<ProductModel>();
        }
    }
}
