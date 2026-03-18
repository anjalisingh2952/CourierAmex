using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Models;
using CourierAmex.Services;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]

    public class ModuleController : ControllerBase
    {
        private readonly ILogger<ModuleController> _logger;
        private readonly IModuleService _service;

        public ModuleController(ILogger<ModuleController> logger, IModuleService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetByCompany(int cid = 0)
        {
            IEnumerable<ModuleModel> response;
            try
            {
                response = await _service.GetByCompanyAsync(cid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Module_GetByCompany' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}
