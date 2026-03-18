using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;

namespace CourierAmex.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticateController : ControllerBase
    {
        private readonly IAuthenticationService _authenticationService;
        private readonly ILogger<AuthenticateController> _logger;

        public AuthenticateController(IAuthenticationService authenticationService, ILogger<AuthenticateController> logger)
        {
            _authenticationService = authenticationService;
            _logger = logger;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid) { return BadRequest(ModelState); }
            var remoteIp = HttpContext?.GetRemoteIPAddress();
            var ipAddress = remoteIp?.ToString() ?? "";

            GenericResponse<LoginResponse> response;
            try
            {
                response = await _authenticationService.ValidateLoginAsync(request, ipAddress);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Login' invocation.", ex);
                return StatusCode(400, ex.Message);
            }

            return new ObjectResult(response);
        }

        [AllowAnonymous]
        [HttpPost("forgot")]
        public async Task<ActionResult> Forgot([FromBody] ForgotRequest request)
        {
            if (!ModelState.IsValid) { return BadRequest(ModelState); }

            GenericResponse<bool> response;
            try
            {
                response = await _authenticationService.ForgotAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Forgot' invocation.", ex);
                return StatusCode(400, ex.Message);
            }

            return new ObjectResult(response);
        }

        [AllowAnonymous]
        [HttpGet("reset/{id}")]
        public async Task<ActionResult> Reset(string id)
        {
            if (string.IsNullOrEmpty(id)) { return BadRequest(ModelState); }

            GenericResponse<UserModel> response = new GenericResponse<UserModel>();
            try
            {
                response = await _authenticationService.GetUserByResetKeyAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Reset' invocation.", ex);
                return StatusCode(400, ex.Message);
            }

            return new ObjectResult(response);
        }

        [AllowAnonymous]
        [HttpPut("reset")]
        public async Task<ActionResult> ResetPassword([FromBody] ResetRequest request)
        {
            if (!ModelState.IsValid) { return BadRequest(ModelState); }

            GenericResponse<bool> response = new();
            try
            {
                response = await _authenticationService.ResetPasswordAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'ResetPassword' invocation.", ex);
                return StatusCode(400, ex.Message);
            }

            return new ObjectResult(response);
        }
    }
}
