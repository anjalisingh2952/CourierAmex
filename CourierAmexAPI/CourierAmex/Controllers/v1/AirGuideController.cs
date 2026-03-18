using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]

    public class AirGuideController : ControllerBase
    {
        private readonly ILogger<AirGuideController> _logger;
        private readonly IAirGuideService _service;

        public AirGuideController(ILogger<AirGuideController> logger, IAirGuideService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet("Guides")]
        public async Task<IActionResult> GetAirGuidesById([FromQuery] int mId, [FromQuery] int cId)
        {
            IEnumerable<AirGuideModel> response;
            try
            {
                response = await _service.GetAirGuidesByIdAsync(mId, cId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'AirGuides_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetMasterGuide")]
        public async Task<IActionResult> GetMasterGuide([FromQuery] int mId)
        {
            IEnumerable<MasterGuideModel> response;
            try
            {
                response = await _service.GetMasterGuide(mId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'AirGuides_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetAirGuideByManifestId")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAirGuideByManifestId(int manifestId)
        {
            IEnumerable<AirGuideModel> response;
            try
            {
                response = await _service.GetAirGuideByManifestIdAsync(manifestId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'AirGuides_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetGuideById")]
        public async Task<IActionResult> GetGuideById([FromQuery] int guideId)
        {
            IEnumerable<GuideDetailModel> response;
            try
            {
                response = await _service.GetGuideById(guideId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'AirGuides_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetPackagesByAirGuideManifestId")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPackagesByAirGuideManifestId(int mId, string gN, int cId)
        {
            IEnumerable<PackageCategoryModel> response;
            try
            {
                response = await _service.GetPackagesByAirGuideByManifestId(mId, gN, cId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'PackagesByAirGuideManifestId' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("CreateOrUpdateMasterGuide")]
        public async Task<IActionResult> CreateOrUpdateMasterGuide([FromBody] MasterGuideModel masterGuide)
        {
            int response;
            try
            {
                response = await _service.CreateOrUpdateMasterGuide(masterGuide);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'CreateOrUpdateMasterGuide' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("CreateOrUpdateChildGuide")]
        public async Task<IActionResult> CreateOrUpdateChildGuide([FromBody] ChildGuideModel childGuide)
        {
            int response;
            try
            {
                response = await _service.CreateOrUpdateChildGuide(childGuide);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'CreateOrUpdateChildGuide' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("DeleteAirGuide")]
        public async Task<IActionResult> DeleteAirGuide([FromQuery] int Id, [FromQuery] int masterId, [FromQuery] Guid userId)
        {
            int response;
            try
            {
                response = await _service.DeleteAirGuide(Id, masterId, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'DeleteAirGuide' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("AssignManifestPackageToGuide")]
        public async Task<IActionResult> AssignManifestPackageToGuide([FromQuery] List<int> packageNumberList,[FromQuery] int manifestId,[FromQuery] string childGuide,[FromQuery] Guid user)
        {
            if (packageNumberList == null || packageNumberList.Count == 0)
            {
                return BadRequest("Package number list cannot be empty.");
            }

            List<int> responseList = new List<int>();
            try
            {
                foreach (int packagenumber in packageNumberList)
                {
                    int response = await _service.AssignManifestPackageToGuide(packagenumber, manifestId, childGuide, user);
                    responseList.Add(response);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'AssignManifestPackageToGuide' invocation: {Message}", ex.Message);
                return StatusCode(500, ex.Message);
            }

            return Ok(responseList);
        }
    }
}
