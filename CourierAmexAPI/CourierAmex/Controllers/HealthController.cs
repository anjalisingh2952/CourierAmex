using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourierAmex.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HealthController : ControllerBase
    {
        private readonly ILogger<HealthController> _logger;

        public HealthController(ILogger<HealthController> logger)
        {
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpGet("Check")]
        public ActionResult Check()
        {
            _logger.LogInformation("Executing Health Check");
            return new ObjectResult("Server is Ok");
        }
    }
}
