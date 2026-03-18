using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class DashboardController : ControllerBase
    {

        private readonly ILogger<DashboardController> _logger;
        private readonly IDashboardService _service;

        public DashboardController(ILogger<DashboardController> logger, IDashboardService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet("chart-data")]
        public async Task<IActionResult> GetChartData( [FromQuery] string clientId,[FromQuery] string fromDate,[FromQuery] string toDate,[FromQuery] string filters,[FromQuery] int? idEmpresa = null,[FromQuery] string? selectedMonth =null,[FromQuery] string? selectedfilter = null)
        {
            try
            {
                if (!DateTime.TryParse(fromDate, out var fromDateParsed) ||
                    !DateTime.TryParse(toDate, out var toDateParsed))
                {
                    return BadRequest("Invalid date format.");
                }

                var result = await _service.GetDashboardData(clientId, fromDateParsed, toDateParsed, filters, idEmpresa,selectedMonth,selectedfilter);
                return Ok(result);
            }
            catch(Exception ex)
            {
                return BadRequest($"Error {ex.Message}");
            }
        }

        [HttpGet("GetProductChartDetail")]
        public async Task<IActionResult> GetProductChartDetail([FromQuery] int idEmpresa, [FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin, [FromQuery] string? invoiceId = null, [FromQuery] int? productId = null, [FromQuery] string months = "Blank")
        {
            try
            {
                
                var result = await _service.GetProductChartDetail(idEmpresa, fechaInicio, fechaFin, invoiceId, productId, months);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error {ex.Message}");
            }
        }

        [HttpGet("GetProductDetailsPaginated")]
        public async Task<IActionResult> GetProductDetailsPaginated([FromQuery] int idEmpresa, [FromQuery] DateTime fechaInicio, [FromQuery] DateTime fechaFin, [FromQuery] string? invoiceId = null, [FromQuery] int? productId = null, [FromQuery] int pageNumber = 1, [FromQuery] int pageSize = 10, [FromQuery] string months = "Blank")
        {
            try
            {
                var result = await _service.GetProductDetailsPaginated(idEmpresa, fechaInicio, fechaFin, invoiceId, productId, pageNumber, pageSize, months);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest($"Error {ex.Message}");
            }
        }
    }
}
