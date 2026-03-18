using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Models;
using CourierAmex.Services;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class ProductController : ControllerBase
    {
        private readonly ILogger<ProductController> _logger;
        private readonly IProductService _service;

        public ProductController(ILogger<ProductController> logger, IProductService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet("Company")]
        public async Task<IActionResult> GetByCompany([FromQuery] int cid = 0)
        {
            IEnumerable<ProductModel> response;
            try
            {
                response = await _service.GetByCompanyAsync(cid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Product_GetByCompany' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}
