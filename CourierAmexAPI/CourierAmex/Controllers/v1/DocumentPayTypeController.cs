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
    public class DocumentPayTypeController : ControllerBase
    {
        private readonly ILogger<DocumentPayTypeController> _logger;
        private readonly IDocumentPayTypeService _service;
        public DocumentPayTypeController(ILogger<DocumentPayTypeController> logger, IDocumentPayTypeService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromQuery] int id)
        {
            GenericResponse<DocumentPayTypeModel> response;
            try
            {
                response = await _service.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'DocumentPayType_GetById' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int cid = 0)
        {
            PagedResponse<DocumentPayTypeModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s,

                };

                response = await _service.GetPagedAsync(request, cid);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'DocumentPayType_GetPaged' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] DocumentPayTypeModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<DocumentPayTypeModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'Location_Post' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }


        [HttpPut]
        public async Task<IActionResult> Put([FromBody] DocumentPayTypeModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<DocumentPayTypeModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'DocumentOayType_Put' invocation. {ex.Message}");
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
                _logger.LogError($"There was an error on 'DocumentPayType_Delete' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}
