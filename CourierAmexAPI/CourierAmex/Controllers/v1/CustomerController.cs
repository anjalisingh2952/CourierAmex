using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class CustomerController : ControllerBase
    {
        private readonly ILogger<CustomerController> _logger;
        private readonly ICustomerService _service;

        public CustomerController(ILogger<CustomerController> logger, ICustomerService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromQuery] long id)
        {
            GenericResponse<CustomerModel>? response;
            try
            {
                response = await _service.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Customer_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetCustomerByCode")]
        public async Task<IActionResult> GetByCode([FromQuery] string code)
        {
            GenericResponse<CustomerModel>? response;
            try
            {
                response = await _service.GetByCodeAsync(code);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetCustomerByCode' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Active")]
        public async Task<IActionResult> GetAllActive()
        {
            GenericResponse<IEnumerable<CustomerModel>> response;
            try
            {
                response = await _service.GetAllActiveAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Customer_GetAllActive' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] int cid, [FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s)
        {
            PagedResponse<CustomerModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetPagedAsync(cid, request);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Customer_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CustomerModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<CustomerModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Customer_Post' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody] CustomerModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<CustomerModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Customer_Put' invocation.", ex.Message);
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
                _logger.LogError("There was an error on 'Customer_Delete' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }



        
        [HttpGet("clients_credit_search")]
        public async Task<IActionResult> GetEnabledCredits([FromQuery] string? filter, [FromQuery] int companyId)
        {
            GenericResponse<IEnumerable<CustomerCreditModel>>? response;
            try
            {
                response = await _service.GetEnabledCreditsAsync(filter, companyId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'clients_credit_search' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        
        [HttpPost("enable_credit")]
        public async Task<IActionResult> EnableCustomerCredit([FromBody] CustomerCreditRequest request)
        {
            var result = await _service.EnableCustomerCreditAsync(request.CustomerCode, request.CompanyId);
            return Ok(result);
        }


        
        [HttpGet("GetAll_customers_enabled")]
        public async Task<IActionResult> GetEnabledCustomerCredits([FromQuery] int companyId)
        {
            var result = await _service.GetEnabledCustomerCreditsAsync(companyId);
            return Ok(result);
        }


        
        [HttpDelete("disable_credit")]
        public async Task<IActionResult> DisableCustomerCredit([FromQuery] string customerCode, [FromQuery] int companyId)
        {
            var result = await _service.DisableCustomerCreditAsync(customerCode, companyId);
            return Ok(result);
        }



    }
}
