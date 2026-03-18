using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CourierAmex.Controllers.v1
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class ExchangeRateController : ControllerBase
    {
        private readonly IExchangeRateFetcher _exchangeRateFetcher;

        public ExchangeRateController(IExchangeRateFetcher exchangeRateFetcher)
        {
            _exchangeRateFetcher = exchangeRateFetcher;
        }

        [HttpGet("USDBuyRate")]
        public async Task<IActionResult> GetUSDBuyRate([FromQuery]DateTime startDate, [FromQuery] DateTime endDate)
        {
            var rateXml = await _exchangeRateFetcher.GetUsdBuyRateAsync(startDate,endDate);
            return Ok(rateXml); // You might want to parse it before returning
        }

        [HttpGet("USDSaleRate")]
        public async Task<IActionResult> GetUSDSaleRate([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var rateXml = await _exchangeRateFetcher.GetUsdSaleRateAsync(startDate, endDate);
            return Ok(rateXml); // You might want to parse it before returning
        }

        [HttpPost("ExchangeRate")]
        public async Task<IActionResult> AddExchangeRate([FromBody] ExchangeRateModel entities)
        {
            GenericResponse<int> response;
            var context = HttpContext.GetWorkContext();

            try
            {
                response = await _exchangeRateFetcher.AddExchangeRateASync(entities);
            }
            catch (Exception ex)
            {
                //_logger.LogError("There was an error on 'AddExchangeRate' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("ExchangeRateHistory")]
        public async Task<IActionResult> GetExchangeRateHistory([FromQuery] int companyId, [FromQuery] string? date)
        {
            GenericResponse<List<ExchangeRateHistoryResponse>> response;
            var context = HttpContext.GetWorkContext();

            try
            {
                response = await _exchangeRateFetcher.GetExchangeRateHistoryAsync(companyId, date);
            }
            catch (Exception ex)
            {
                //_logger.LogError("There was an error on 'AddExchangeRate' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }

}
