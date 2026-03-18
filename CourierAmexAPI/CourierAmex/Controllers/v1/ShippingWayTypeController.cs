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
    public class ShippingWayTypeController : ControllerBase
    {
        private readonly ILogger<ShippingWayTypeController> _logger;
        private readonly IShippingWayTypeService _service;

        public ShippingWayTypeController(ILogger<ShippingWayTypeController> logger, IShippingWayTypeService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromQuery] int id)
        {
            GenericResponse<ShippingWayTypeModel>? response;
            try
            {
                response = await _service.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'ShippingWayType_GetById' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s)
        {
            PagedResponse<ShippingWayTypeModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s,
                    
                };

                response = await _service.GetPagedAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'ShippingWayType_GetPaged' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ShippingWayTypeModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<ShippingWayTypeModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'ShippingWayType_Post' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody] ShippingWayTypeModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<ShippingWayTypeModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'ShippingWayType_Put' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] int id)
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
                _logger.LogError($"There was an error on 'ShippingWayType_Delete' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}
