using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Models;
using CourierAmex.Services;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]

    public class TemplateController : ControllerBase
    {
        private readonly ILogger<TemplateController> _logger;
        private readonly ITemplateService _service;

        public TemplateController(ILogger<TemplateController> logger, ITemplateService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet("Module")]
        public async Task<IActionResult> GetByCompanyModule(string mid, int cid = 0)
        {
            IEnumerable<TemplateModel> response;
            try
            {
                response = await _service.GetByCompanyModuleAsync(mid, cid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Template_GetByCompanyModule' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}
