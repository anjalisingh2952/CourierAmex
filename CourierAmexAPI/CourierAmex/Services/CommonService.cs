using AutoMapper;

using CourierAmex.Storage.Repositories;
using CourierAmex.Models;

namespace CourierAmex.Services
{
    public class CommonService : ICommonService
    {
        private readonly ICompanyRepository _companyRepository;
        private readonly ICountryRepository _countryRepository;
        private readonly ILocationRepository _locationRepository;
        private readonly IStateRepository _stateRepository;
        private readonly ISupplierRepository _supplierRepository;
        private readonly IZoneRepository _zoneRepository;
        private readonly IPermissionRepository _permissionRepository;
        private readonly IUserRepository _userRepository;
        private readonly IAreaRepository _areaRepository;
        private readonly IDocumentTypeRepository _documentTypeRepository;
        private readonly ICustomerPayTypeRepository _customerPayTypeRepository;
        private readonly IClientCategoryRepository _clientCategoryRepository;
        private readonly IPackageStatusRepository _packageStatusRepository;
        private readonly IShippingWayTypeRepository _shippingWayTypeRepository;
        private readonly IManifestRepository _manifestRepository;
        private readonly IPackageRepository _packageRepository;
        private readonly ICommodityRepository _commodityRepository;
        private readonly IMapper _mapper;

        public CommonService(IMapper mapper, ICountryRepository countryRepository, IStateRepository stateRepository, IZoneRepository zoneRepository,
            IPermissionRepository permissionRepository, IUserRepository userRepository, ILocationRepository locationRepository, ISupplierRepository supplierRepository,
            IAreaRepository areaRepository, IDocumentTypeRepository documentTypeRepository, ICustomerPayTypeRepository customerPayTypeRepository, IManifestRepository manifestRepository,
            ICompanyRepository companyRepository, IClientCategoryRepository clientCategoryRepository, IPackageStatusRepository packageStatusRepository, IShippingWayTypeRepository shippingWayTypeRepository,
            IPackageRepository packageRepository, ICommodityRepository commodityRepository)
        {
            _mapper = mapper;
            _companyRepository = companyRepository;
            _permissionRepository = permissionRepository;
            _countryRepository = countryRepository;
            _stateRepository = stateRepository;
            _zoneRepository = zoneRepository;
            _areaRepository = areaRepository;
            _userRepository = userRepository;
            _locationRepository = locationRepository;
            _supplierRepository = supplierRepository;
            _documentTypeRepository = documentTypeRepository;
            _customerPayTypeRepository = customerPayTypeRepository;
            _clientCategoryRepository = clientCategoryRepository;
            _packageStatusRepository = packageStatusRepository;
            _shippingWayTypeRepository = shippingWayTypeRepository;
            _manifestRepository = manifestRepository;
            _packageRepository = packageRepository;
            _commodityRepository = commodityRepository;
        }

        public async Task<IEnumerable<CompanyModel>> GetAllCompaniesAsync()
        {
            IEnumerable<CompanyModel> result = new List<CompanyModel>();
            var companies = await _companyRepository.GetAllAsync();
            if (null != companies && companies.Any())
            {
                result = _mapper.Map<IEnumerable<CompanyModel>>(companies);
            }

            return result;
        }

        public async Task<IEnumerable<CountryModel>> GetAllCountriesAsync()
        {
            IEnumerable<CountryModel> result = new List<CountryModel>();
            var countries = await _countryRepository.GetAllAsync();
            if (null != countries && countries.Any())
            {
                result = _mapper.Map<IEnumerable<CountryModel>>(countries);
            }

            return result;
        }

        public async Task<IEnumerable<StateModel>> GetStatesbyCountryIdAsync(int countryId)
        {
            IEnumerable<StateModel> result = new List<StateModel>();
            var states = await _stateRepository.GetByCountryAsync(countryId);
            if (null != states && states.Any())
            {
                result = _mapper.Map<IEnumerable<StateModel>>(states);
            }

            return result;
        }

        public async Task<IEnumerable<ZoneModel>> GetZonesbyStateIdAsync(int stateId)
        {
            IEnumerable<ZoneModel> result = new List<ZoneModel>();
            var zones = await _zoneRepository.GetByStateAsync(stateId);
            if (null != zones && zones.Any())
            {
                result = _mapper.Map<IEnumerable<ZoneModel>>(zones);
            }

            return result;
        }

        public async Task<IEnumerable<AreaModel>> GetAreasbyZoneIdAsync(int zoneId)
        {
            IEnumerable<AreaModel> result = new List<AreaModel>();
            var zones = await _areaRepository.GetByZoneAsync(zoneId);
            if (null != zones && zones.Any())
            {
                result = _mapper.Map<IEnumerable<AreaModel>>(zones);
            }

            return result;
        }

        public async Task<IEnumerable<SupplierModel>> GetAllSuppliersAsync(int companyId)
        {
            IEnumerable<SupplierModel> result = new List<SupplierModel>();
            var suppliers = await _supplierRepository.GetByCompanyAsync(companyId);
            if (null != suppliers && suppliers.Any())
            {
                result = _mapper.Map<IEnumerable<SupplierModel>>(suppliers);
            }

            return result;
        }

        public async Task<IEnumerable<LocationModel>> GetAllLocationsAsync(int companyId, int supplierId)
        {
            IEnumerable<LocationModel> result = new List<LocationModel>();
            var entities = await _locationRepository.GetByCompanyAsync(companyId, supplierId);
            if (null != entities && entities.Any())
            {
                result = _mapper.Map<IEnumerable<LocationModel>>(entities.Where(x => x.IsSelected));
            }

            return result;
        }

        public async Task<IEnumerable<DocumentTypeModel>> GetAllDocumentTypesAsync(int companyId)
        {
            IEnumerable<DocumentTypeModel> result = new List<DocumentTypeModel>();
            var entities = await _documentTypeRepository.GetByCompanyAsync(companyId);
            if (null != entities && entities.Any())
            {
                result = _mapper.Map<IEnumerable<DocumentTypeModel>>(entities);
            }

            return result;
        }

        public async Task<IEnumerable<CustomerPayTypeModel>> GetAllCustomerPayTypesAsync(int companyId)
        {
            var entities = await _customerPayTypeRepository.GetAllActiveAsync(companyId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<CustomerPayTypeModel>>(entities);
            }

            return new List<CustomerPayTypeModel>();
        }

        public async Task<IEnumerable<ClientCategoryModel>> GetAllCustomerCategoriesAsync(int companyId)
        {
            var entities = await _clientCategoryRepository.GetByCompanyAsync(companyId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<ClientCategoryModel>>(entities);
            }

            return new List<ClientCategoryModel>();
        }

        public async Task<IEnumerable<PackageStatusModel>> GetAllPackageStatusAsync()
        {
            var entities = await _packageStatusRepository.GetActiveAsync();
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<PackageStatusModel>>(entities);
            }

            return new List<PackageStatusModel>();
        }
        
        public async Task<IEnumerable<ShippingWayTypeModel>> GetShipppingWayTypeByShipTypeAsync(int shipType)
        {
            var entities = await _shippingWayTypeRepository.GetAllActiveAsync(shipType);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<ShippingWayTypeModel>>(entities);
            }

            return new List<ShippingWayTypeModel>();
        }

        public async Task<IEnumerable<CommodityModel>> GetAllCommoditiesByCompanyAsync(int companyId)
        {
            var entities = await _commodityRepository.GetAllActiveAsync(companyId);
            if (null != entities)
            {
                return _mapper.Map<IEnumerable<CommodityModel>>(entities);
            }

            return new List<CommodityModel>();
        }

        public async Task<IEnumerable<PermissionModel>> GetAllPermissionsAsync()
        {
            IEnumerable<PermissionModel> result = new List<PermissionModel>();
            var entities = await _permissionRepository.GetAllAsync();
            if (null != entities && entities.Any())
            {
                result = _mapper.Map<IEnumerable<PermissionModel>>(entities);
            }

            return result;
        }

        public async Task<GenericResponse<bool>> ValidateUsernameAsync(string id, string username)
        {
            GenericResponse<bool> result = new();
            var guid = id.Length > 0 ? Guid.Parse(id) : Guid.Empty;
            var entities = await _userRepository.ValidateUsernameAsync(guid, username);
            if (null != entities)
            {
                result.Success = entities.Any();
            }

            return result;
        }

        public async Task<GenericResponse<bool>> ValidateManifestNumberAsync(long id, string number)
        {
            GenericResponse<bool> result = new();
            var entities = await _manifestRepository.ValidateNumberAsync(id, number);
            if (null != entities)
            {
                result.Success = entities.Any();
            }

            return result;
        }

        public async Task<GenericResponse<bool>> ValidatePackageNumberAsync(int id, int number)
        {
            GenericResponse<bool> result = new();
            var entities = await _packageRepository.ValidateNumberAsync(id, number);
            if (null != entities)
            {
                result.Success = entities.Any();
            }

            return result;
        }

        public async Task<GenericResponse<bool>> ValidatePackageStatusCodeAsync(int id, string code)
        {
            GenericResponse<bool> result = new();
            var entities = await _packageStatusRepository.ValidateCodeAsync(id, code);
            if (null != entities)
            {
                result.Success = entities.Any();
            }

            return result;
        }

        public async Task<GenericResponse<bool>> ValidateCommodityCodeAsync(int id, int companyId, string code)
        {
            GenericResponse<bool> result = new();
            var entities = await _commodityRepository.ValidateCodeAsync(id, companyId, code);
            if (null != entities)
            {
                result.Success = entities.Any();
            }

            return result;
        }
    }
}
