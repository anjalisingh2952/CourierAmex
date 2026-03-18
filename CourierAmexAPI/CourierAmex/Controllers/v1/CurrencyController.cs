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

    public class CurrencyController : ControllerBase
    {
        private readonly ILogger<CurrencyController> _logger;
        private readonly ICurrencyService _service;

        public CurrencyController(ILogger<CurrencyController> logger, ICurrencyService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetByCompany(int cid = 0)
        {
            GenericResponse<IEnumerable<Currency>> response;
            try
            {
                response = await _service.GetByCompanyAsync(cid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Currency_GetByCompany' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}
