using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Storage.Domain;
using DocumentFormat.OpenXml.Spreadsheet;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class CashierController : ControllerBase
    {
        private readonly ILogger<CashierController> _logger;
        private readonly ICashierService _service;

        public CashierController(ILogger<CashierController> logger, ICashierService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromQuery] short id)
        {
            GenericResponse<CashierModel>? response;
            try
            {
                response = await _service.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Cashier_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Active")]
        public async Task<IActionResult> GetAllActive()
        {
            GenericResponse<IEnumerable<CashierModel>> response;
            try
            {
                response = await _service.GetAllActiveAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Cashier_GetAllActive' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int cid = 0)
        {
            PagedResponse<CashierModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetPagedAsync(request, cid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Cashier_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CashierModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<CashierModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Cashier_Post' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody] CashierModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<CashierModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Cashier_Put' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] short id)
        {
            GenericResponse<bool> response = new();
            var context = HttpContext.GetWorkContext();
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                await _service.DeleteAsync(id, userId);
                response.Success = true;
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Cashier_Delete' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }


        [HttpGet("UserByPointOfSaleId")]
        public async Task<IActionResult> GetUserByPointOfSale([FromQuery] int companyId, [FromQuery] int pointOfSaleId)
        {
            List<UserByPointOfSaleModel> response;
            try
            {
                response = await _service.GetUserByPointOfSale(companyId,pointOfSaleId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetUserByPointOfSale' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("InsertUserToCashier")]
        public async Task<IActionResult> InsertUserToCashier([FromBody] List<UserCashier> userList)
        {
            var responses = new List<GenericResponse<bool>>();
            try
            {
                foreach (var user in userList)
                {
                    var result = await _service.InsertUserToCashier(user.CompanyId, user.PointOfSaleId, user.User);
                    responses.Add(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error in 'InsertUserToCashier' invocation: {Message}", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(responses);
        }
    }
}
