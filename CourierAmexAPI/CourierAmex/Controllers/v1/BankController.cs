using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Models;
using CourierAmex.Services;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]

    public class BankController : ControllerBase
    {
        private readonly ILogger<BankController> _logger;
        private readonly IBankService _service;

        public BankController(ILogger<BankController> logger, IBankService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetByCompany(int cid = 0)
        {
            GenericResponse<IEnumerable<BankModel>> response;
            try
            {
                response = await _service.GetByCompanyAsync(cid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Bank_GetByCompany' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Brand")]
        public async Task<IActionResult> GetBrandByCompany(int cid = 0)
        {
            GenericResponse<IEnumerable<BrandModel>> response;
            try
            {
                response = await _service.GetBrandByCompanyAsync(cid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Brand_GetByCompany' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}
