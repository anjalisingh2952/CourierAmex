using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class PackageController : ControllerBase
    {
        private readonly ILogger<PackageController> _logger;
        private readonly IPackageService _service;

        public PackageController(ILogger<PackageController> logger, IPackageService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromQuery] int id)
        {
            GenericResponse<PackageModel>? response;
            try
            {
                response = await _service.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetByPackageNumber")]
        public async Task<IActionResult> GetByPackageNumberAsync([FromQuery] int cid, [FromQuery] int pn)
        {
            GenericResponse<PackageModel>? response;
            try
            {
                response = await _service.GetByPackageNumberAsync(cid, pn);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetByPackageNumberAsync' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
        
        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int cid = 0, [FromQuery] int sid = 0)
        {
            PagedResponse<PackageModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetPagedAsync(request, cid, sid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("PagedByManifest")]
        public async Task<IActionResult> GetPagedbyManifest([FromQuery] int ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int cid = 0, [FromQuery] int mid = 0)
        {
            PagedResponse<PackageCategoryModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetPagedByManifestAsync(request, cid, mid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
        [HttpGet("PagedPriceByManifest")]
        public async Task<IActionResult> GetPagedPricebyManifest([FromQuery] int ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int cid = 0, [FromQuery] int mid = 0)
        {
            PagedResponse<PackageCategoryModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetPagedPriceByManifestAsync(request, cid, mid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetByManifestAirGuide")]
        public async Task<IActionResult> GetbyManifestAirGuide([FromQuery] int cid = 0, [FromQuery] int mid = 0, [FromQuery] string airGuide = "")
        {
            PagedResponse<PackageCategoryModel> response;
            try
            {
                response = await _service.GetByManifestAirGuideAsync(cid, mid, airGuide);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_ByManifestAirGuide' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut("CategoryUpdate")]
        public async Task<IActionResult> CategoryUpdate([FromBody] BulkPackageCategory entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackageCategoryModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CategoryUpdateAsync(entity, userId);

            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Category_Post' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }


        [HttpPost]
        public async Task<IActionResult> Post([FromBody] PackageModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackageModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_Post' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody] PackageModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackageModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_Put' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] int id)
        {
            GenericResponse<bool> response = new();
            var context = HttpContext.GetWorkContext();
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.DeleteAsync(id, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_Delete' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("EventsPaged")]
        public async Task<IActionResult> GetEventsPaged([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int cid = 0)
        {
            PagedResponse<PackageEventModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetEventsPagedAsync(request, cid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetEventsPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }



        [HttpPost("ClassifyPackage")]
        public async Task<IActionResult> ClassifyPackage([FromBody] Models.ClassifyPackage entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<Models.ClassifyPackage> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.ClassifyPackageAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'ClassifyPackage' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("GetPackageDetailByManifestId")]
        public async Task<IActionResult> GetPackageDetailByManifestId([FromBody] int manifestId)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackageDetail> response;
            try
            {
                response = await _service.GetPackageDetailByManifestId(manifestId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetPackageDetailByManifestId' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetNextReferenceAsync")]
        public async Task<IActionResult> GetNextConsecutivoAsync([FromQuery] string packagingType, [FromQuery] int length)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<string> response;
            try
            {
                response = await _service.GetNextConsecutivoAsync(packagingType, length);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetNextConsecutivoAsync' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetPackageDetailByManifestIdAndAirGuideId")]
        public async Task<IActionResult> GetPackageDetailByManifestIdAndAirGuideId([FromQuery] string airGuideId, [FromQuery] int manifestId)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackageDetail> response;
            try
            {
                response = await _service.GetPackageDetailByManifestIdAndAirGuideIdAsync(airGuideId, manifestId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetPackageDetailByManifestIdAndAirGuideId' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }


        [HttpGet("PackPackageGuide")]
        public async Task<IActionResult> PackPackageGuide([FromQuery] int packageNumber, [FromQuery] string bagNumber, [FromQuery] string palet, [FromQuery] string manifestNumber, [FromQuery] int packageSubType, [FromQuery] string user)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<int> response;
            try
            {
                response = await _service.PackPackageGuide(packageNumber, bagNumber, int.Parse(palet), manifestNumber, packageSubType, user);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'PackPackageGuide' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
            return Ok(response);
        }

        [HttpGet("GetPackagedPackages")]
        public async Task<IActionResult> GetPackagedPackages([FromQuery] string airGuideId, [FromQuery] int manifestId, [FromQuery] int packed)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<List<PackagedPackage>> response;
            try
            {
                airGuideId = airGuideId == "null" ? null : airGuideId;
                response = await _service.GetPackagedPackages(airGuideId, manifestId, packed);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetPackagedPackages' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("RegisterBagPackaging")]
        public async Task<IActionResult> RegisterBagPackaging([FromBody] RegisterBagPackagingRequest request)
        {
            var context = HttpContext.GetWorkContext();
            try
            {
                await _service.RegisterBagPackaging(request.ManifestId,
                     request.Bag,
                     request.TaxType,
                     request.Width,
                     request.Height,
                     request.Length,
                     request.ActualVolumeWeight,
                     request.ActualWeight,
                     request.SystemVolumeWeight,
                     request.SystemWeight,
                     request.Packages,
                     request.PackagingType,
                     request.Sequence,
                     request.Category,
                     request.User,
                     request.IsConsolidated,
                     request.Pallet);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'RegisterBagPackaging' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
            return Ok(200);
        }

        [HttpGet("PackPackage")]
        public async Task<IActionResult> PackPackage([FromQuery] int packageNumber, [FromQuery] string bagNumber, [FromQuery] string palet, [FromQuery] string manifestNumber, [FromQuery] int packageSubType, [FromQuery] string user)

        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<int> response;
            try
            {
                response = await _service.PackPackage(packageNumber, bagNumber, 12, manifestNumber, packageSubType, user);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'PackPackage' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
            return Ok(response);
        }

        [HttpGet("GetPackedPackages")]
        public async Task<IActionResult> GetPackedPackages([FromQuery] string category, [FromQuery] string airGuideId, [FromQuery] int manifestId, [FromQuery] int packed, [FromQuery] int? pallet)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackagedPackagedResponse> response;
            try
            {
                airGuideId = airGuideId == "null" ? null : airGuideId;
                response = await _service.GetPackedPackages(category, airGuideId, manifestId, packed, pallet);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetPackedPackages' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetAirGuideManifest")]
        public async Task<IActionResult> GetAirGuideManifest([FromQuery] int manifestId)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<List<PackagedPackage>> response;
            try
            {
                response = await _service.GetAirGuideManifest(manifestId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetAirGuideManifest' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut("PackagePriceUpdateBulk")]
        public async Task<IActionResult> PackagePriceUpdate([FromBody] List<Models.PackagePriceUpdateModel> packages)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<string> response;
            try
            {
                response = await _service.PackagePriceUpdate(packages);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'PackagePriceUpdateBulk' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut("PackagePriceUpdate")]
        public async Task<IActionResult> PackagePriceUpdate([FromBody] Models.PackagePriceUpdateModel package)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<string> response;
            try
            {
                response = await _service.PackagePriceUpdate(package);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'PackagePriceUpdate' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("UnpackPackage")]
        public async Task<IActionResult> UnpackPackage([FromBody] int packageNumber)
        {
            var context = HttpContext.GetWorkContext();
            try
            {
                await _service.UnpackPackage(packageNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'UnpackPackage' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
            return Ok(200);
        }

        [HttpPost("UnpackPackageConsolidated")]
        public async Task<IActionResult> UnpackPackageConsolidated([FromBody] int packageNumber)
        {
            var context = HttpContext.GetWorkContext();
            try
            {
                await _service.UnpackPackageConsolidated(packageNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'UnpackPackageConsolidated' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
            return Ok(200);
        }

        [HttpGet("ManifestPackage")]
        public async Task<IActionResult> GetManifestPackage([FromQuery] string manifestNumber)
        {
            GenericResponse<List<ManifestPackage>> response;
            try
            {
                response = await _service.GetManifestPackageAsync(manifestNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        
        [HttpPost("unassign-package")]
        public async Task<IActionResult> UnassignPackage([FromBody] UnassignPackageRequest request)
        {
            GenericResponse<int> response = new();
            try
            {
                response = await _service.UnassignPackageAsync(
                request.PackageId,
                request.ManifestId,
                request.InitialStateId,
                request.ModifiedBy,
                request.ForceRemove);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'UnassignPackage' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
       
        [HttpGet("SearchPackage")]
        public async Task<IActionResult> SearchPackageAsync([FromQuery] int packageNumber = 0, [FromQuery] string courierNumber = "", [FromQuery] string customerAccount = "")
        {
            GenericResponse<List<PackageModel>>? response;

            try
            {
                response = await _service.SearchPackageAsync(packageNumber, courierNumber, customerAccount);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'SearchPackageAsync' invocation.", ex);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

      
        [HttpGet("GetPackageForCustomerService")]
        public async Task<IActionResult> GetPackageForCustomerService([FromQuery] int id)
        {
            GenericResponse<PackageModel>? response;

            try
            {
                response = await _service.GetPackageForCustomerServiceAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetPackageForCustomerServiceAsync' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        
        [HttpPost("GetPackagesByInvoiceStatus")]
        public async Task<IActionResult> GetPackagesByInvoiceStatus([FromBody] GetPackageByInvoiceStatusRequest request)
        {
            var context = HttpContext.GetWorkContext();
            try
            {
                var result = await _service.GetPackagesByInvoiceStatusAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError("Error in GetPackagesByInvoiceStatus", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }

       
        [HttpPost("UpdatePackageInvoiceStatus")]
        public async Task<IActionResult> UpdatePackageInvoiceStatus([FromBody] UpdatePackageInvoiceStatusRequest request)
        {
            var context = HttpContext.GetWorkContext();

            try
            {
                var result = await _service.UpdatePackageInvoiceStatusAsync(request);
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError("Error in UpdatePackageInvoiceStatus", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }

        
        [HttpPost("UpdatePackageCommodityAndPrice")]
        public async Task<IActionResult> UpdatePackageCommodityAndPrice([FromBody] UpdatePackageCommodityPriceModel package)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<string> response;

            try
            {
                // Call the service method to perform the update
                response = await _service.UpdatePackageCommodityAndPrice(package);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'UpdatePackageCommodityAndPrice' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
        
        [HttpGet("GetPendingBillingPackages")]
        public async Task<IActionResult> GetPendingBillingPackages([FromQuery] int companyId)
        {
            GenericResponse<List<PendingBillingPackageModel>>? response;

            try
            {
                response = await _service.GetPendingBillingPackagesAsync(companyId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetPendingBillingPackagesAsync' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

       
        [HttpGet("GetActiveCommodities")]
        public async Task<IActionResult> GetCommodities([FromQuery] int companyId)
        {
            GenericResponse<List<Commodities>>? response;

            try
            {
                response = await _service.GetCommoditiesAsync(companyId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error in 'GetCommoditiesAsync'.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }





    }
}

    