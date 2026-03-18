using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Models;
using CourierAmex.Services;

namespace CourierAmex.Controllers.V1
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class CommonController : ControllerBase
    {
        private readonly ILogger<CommonController> _logger;
        private readonly ICommonService _commonService;

        public CommonController(ILogger<CommonController> logger, ICommonService commonService)
        {
            _logger = logger;
            _commonService = commonService;
        }

        [HttpGet("Companies")]
        public async Task<IActionResult> GetAllCompanies()
        {
            IEnumerable<CompanyModel> response;
            try
            {
                response = await _commonService.GetAllCompaniesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAllCompanies' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Countries")]
        public async Task<IActionResult> GetAllCountries()
        {
            IEnumerable<CountryModel> response;
            try
            {
                response = await _commonService.GetAllCountriesAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAllCountries' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("States")]
        public async Task<IActionResult> GetStatesByCountry([FromQuery] int id)
        {
            IEnumerable<StateModel> response;
            try
            {
                response = await _commonService.GetStatesbyCountryIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetStatesByCountry' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Zones")]
        public async Task<IActionResult> GetZonesByState([FromQuery] int id)
        {
            IEnumerable<ZoneModel> response;
            try
            {
                response = await _commonService.GetZonesbyStateIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetStatesByCountry' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Areas")]
        public async Task<IActionResult> GetAreasByZone([FromQuery] int id)
        {
            IEnumerable<AreaModel> response;
            try
            {
                response = await _commonService.GetAreasbyZoneIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAreasByZone' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("DocumentTypes")]
        public async Task<IActionResult> GetAllDocumentTypes([FromQuery] int id)
        {
            IEnumerable<DocumentTypeModel> response;
            try
            {
                response = await _commonService.GetAllDocumentTypesAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAllDocumentTypes' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Suppliers")]
        public async Task<IActionResult> GetAllSuppliers([FromQuery] int id)
        {
            IEnumerable<SupplierModel> response;
            try
            {
                response = await _commonService.GetAllSuppliersAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAllSuppliers' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Locations")]
        public async Task<IActionResult> GetAllLocations([FromQuery] int id, [FromQuery] int sid)
        {
            IEnumerable<LocationModel> response;
            try
            {
                response = await _commonService.GetAllLocationsAsync(id, sid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAllLocations' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("CustomerPayTypes")]
        public async Task<IActionResult> GetAllCustomerPayTypes([FromQuery] int id)
        {
            IEnumerable<CustomerPayTypeModel> response;
            try
            {
                response = await _commonService.GetAllCustomerPayTypesAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAllCustomerPayTypes' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("CustomerCategories")]
        public async Task<IActionResult> GetAllCustomerCategories([FromQuery] int id)
        {
            IEnumerable<ClientCategoryModel> response;
            try
            {
                response = await _commonService.GetAllCustomerCategoriesAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAllCustomerCategories' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("PackageStatus")]
        public async Task<IActionResult> GetAllPackageStatus()
        {
            IEnumerable<PackageStatusModel> response;
            try
            {
                response = await _commonService.GetAllPackageStatusAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAllPackageStatus' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("ShippingWayTypes")]
        public async Task<IActionResult> GetShippingWayTypesByShipType([FromQuery] int id)
        {
            IEnumerable<ShippingWayTypeModel> response;
            try
            {
                response = await _commonService.GetShipppingWayTypeByShipTypeAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetShippingWayTypesByShipType' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Commodity")]
        public async Task<IActionResult> GetCommoditiesByCompany([FromQuery] int id)
        {
            IEnumerable<CommodityModel> response;
            try
            {
                response = await _commonService.GetAllCommoditiesByCompanyAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetCommoditiesByCompany' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }


        [HttpGet("Permissions")]
        public async Task<IActionResult> GetAllPermissions()
        {
            IEnumerable<PermissionModel> response;
            try
            {
                response = await _commonService.GetAllPermissionsAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAllPermissions' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("UsernameValidate")]
        public async Task<IActionResult> ValidateUsername([FromQuery] string username, [FromQuery] string? id)
        {
            GenericResponse<bool> response;
            try
            {
                id = id != null ? id : "";
                response = await _commonService.ValidateUsernameAsync(id, username);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'ValidateUsername' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("ManifestNumberValidate")]
        public async Task<IActionResult> ManifestNumberValidate([FromQuery] string number, [FromQuery] long id = 0)
        {
            GenericResponse<bool> response;
            try 
            {
                response = await _commonService.ValidateManifestNumberAsync(id, number);
            }
            catch (Exception ex) 
            {
                _logger.LogError("There was an error on 'ManifestNumberValidate' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("PackageNumberValidate")]
        public async Task<IActionResult> PackageNumberValidate([FromQuery] int number, [FromQuery] int id = 0)
        {
            GenericResponse<bool> response;
            try {
                response = await _commonService.ValidatePackageNumberAsync(id, number);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'PackageNumberValidate' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("PackageStatusCodeValidate")]
        public async Task<IActionResult> PackageStatusCodeValidate([FromQuery] int id, [FromQuery] string code)
        {
            GenericResponse<bool> response;
            try
            {
                response = await _commonService.ValidatePackageStatusCodeAsync(id, code);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'PackageStatusCodeValidate' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("CommodityCodeValidate")]
        public async Task<IActionResult> CommodityCodeValidate([FromQuery] int id, [FromQuery] int companyId, [FromQuery] string code)
        {
            GenericResponse<bool> response;
            try
            {
                response = await _commonService.ValidateCommodityCodeAsync(id, companyId, code);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'CommodityCodeValidate' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

       
    }
}
