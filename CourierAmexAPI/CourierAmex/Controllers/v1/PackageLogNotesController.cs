using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace CourierAmex.Controllers.v1
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class PackageLogNotesController : ControllerBase
    {
        private readonly ILogger<PackageController> _logger;
        private readonly IPackageLogNotesService _service;
        public PackageLogNotesController(ILogger<PackageController> logger, IPackageLogNotesService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet("GetByNumeroAndCliente")]
        public async Task<IActionResult> GetByNumeroByCliente(int? numeroPckg = null, string codigoCliente = "")
        {
            PagedResponse<PackageLogNotesModel>? response = new();
            try
            {
                response = await _service.GetByNumeroByClienteAsync(numeroPckg, codigoCliente);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'PackageLogNotes_GetByNumeroByCliente' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
            return Ok(response);
        }

        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] string codigoCliente = "", [FromQuery] int numeroPckg=0)
        {
            PagedResponse<PackageLogNotesModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetPagedAsync(request, codigoCliente, numeroPckg);

            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'PackageLogNotes_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
        [HttpPost]
        public async Task<IActionResult> Post([FromBody] PackageLogNotesModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackageLogNotesModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'PackageLogNotes_Post' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }


        [HttpPut]
        public async Task<IActionResult> Put([FromBody] PackageLogNotesModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackageLogNotesModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'PackageLogNotes_Put' invocation. {ex.Message}");
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
                _logger.LogError($"There was an error on 'PackageLogNotes_Delete' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}
