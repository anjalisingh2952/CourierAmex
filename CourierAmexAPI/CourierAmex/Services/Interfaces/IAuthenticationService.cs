using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IAuthenticationService
    {
        Task<GenericResponse<LoginResponse>> ValidateLoginAsync(LoginRequest request, string ipAddress);
        Task<GenericResponse<bool>> ForgotAsync(ForgotRequest request);
        Task<GenericResponse<UserModel>> GetUserByResetKeyAsync(string resetKey);
        Task<GenericResponse<bool>> ResetPasswordAsync(ResetRequest request);
    }
}
