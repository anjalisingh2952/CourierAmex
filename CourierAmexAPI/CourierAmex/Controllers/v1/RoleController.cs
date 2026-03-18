using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class RoleController : ControllerBase
    {
        private readonly ILogger<RoleController> _logger;
        private readonly IRoleService _service;

        public RoleController(ILogger<RoleController> logger, IRoleService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetAllActive([FromQuery] int id)
        {
            IEnumerable<RoleModel> response;
            try
            {
                response = await _service.GetAllActiveAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Role_GetAllActive' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromQuery] string id)
        {
            GenericResponse<RoleModel>? response;
            try
            {
                response = await _service.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Role_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int? cid)
        {
            PagedResponse<RoleModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s,
                    CompanyId = cid.HasValue ? cid.Value : null
                };

                response = await _service.GetPagedAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Role_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] RoleModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<RoleModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Role_Post' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody] RoleModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<RoleModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Role_Put' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] string id)
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
                _logger.LogError("There was an error on 'Role_Delete' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}
