using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Controllers.V1
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class SystemSettingController : ControllerBase
    {
        private readonly ILogger<SystemSettingController> _logger;
        private readonly ISystemSettingService _service;

        public SystemSettingController(ILogger<SystemSettingController> logger, ISystemSettingService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAll()
        {
            GenericResponse<IEnumerable<SystemSettingModel>> response = new GenericResponse<IEnumerable<SystemSettingModel>>();
            try
            {
                var context = HttpContext.GetWorkContext();
                response = await _service.GetAllAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'SystemSetting_GetAll' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut("Bulk")]
        public async Task<IActionResult> BulkUpdate([FromBody] IEnumerable<SystemSettingModel> entities)
        {
            GenericResponse<bool> response;
            var context = HttpContext.GetWorkContext();

            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.BulkUpdateAsync(entities, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'SystemSetting_Bulk' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

       
    }
}
