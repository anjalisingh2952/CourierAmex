using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface ICommonService
    {
        Task<IEnumerable<CompanyModel>> GetAllCompaniesAsync();
        Task<IEnumerable<CountryModel>> GetAllCountriesAsync();
        Task<IEnumerable<StateModel>> GetStatesbyCountryIdAsync(int countryId);
        Task<IEnumerable<ZoneModel>> GetZonesbyStateIdAsync(int stateId);
        Task<IEnumerable<AreaModel>> GetAreasbyZoneIdAsync(int zoneId);
        Task<IEnumerable<PermissionModel>> GetAllPermissionsAsync();
        Task<IEnumerable<SupplierModel>> GetAllSuppliersAsync(int companyId);
        Task<IEnumerable<LocationModel>> GetAllLocationsAsync(int companyId, int supplierId);
        Task<IEnumerable<DocumentTypeModel>> GetAllDocumentTypesAsync(int companyId);
        Task<IEnumerable<CustomerPayTypeModel>> GetAllCustomerPayTypesAsync(int companyId);
        Task<IEnumerable<ClientCategoryModel>> GetAllCustomerCategoriesAsync(int companyId);
        Task<IEnumerable<PackageStatusModel>> GetAllPackageStatusAsync();
        Task<IEnumerable<ShippingWayTypeModel>> GetShipppingWayTypeByShipTypeAsync(int shipType);
        Task<IEnumerable<CommodityModel>> GetAllCommoditiesByCompanyAsync(int companyId);
        Task<GenericResponse<bool>> ValidateUsernameAsync(string id, string username);
        Task<GenericResponse<bool>> ValidateManifestNumberAsync(long id, string number);
        Task<GenericResponse<bool>> ValidatePackageNumberAsync(int id, int number);
        Task<GenericResponse<bool>> ValidatePackageStatusCodeAsync(int id, string code);
        Task<GenericResponse<bool>> ValidateCommodityCodeAsync(int id, int companyId, string code);
    }
}
