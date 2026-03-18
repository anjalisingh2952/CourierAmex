using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourierAmex.Controllers.v1
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class PackageNotesController : ControllerBase
    {
        private readonly ILogger<PackageNotesController> _logger;
        private readonly IPackageNotesService _service;
        public PackageNotesController(ILogger<PackageNotesController> logger, IPackageNotesService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromQuery] int id)
        {
            GenericResponse<PackageNotesModel>? response;
            try
            {
                response = await _service.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'PacakgeNotes_GetById' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int cid = 0, [FromQuery] string codigoCliente = "", [FromQuery] string numeroCourier = "")
        {
            PagedResponse<PackageNotesModel> response;
            try
            {
                var request = new FilterByRequest {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };
                response = await _service.GetPagedAsync(request, cid, codigoCliente, numeroCourier);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'PackageNotes_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] PackageNotesModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackageNotesModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'PackageNotes_Post' invocation. {ex.Message}");
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
                _logger.LogError($"There was an error on 'PackageNotes_Delete' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}
