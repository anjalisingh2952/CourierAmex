using System.Security.Claims;
using System.Text;
using System.Web;

using AutoMapper;

using CourierAmex.Storage;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Repositories;
using CourierAmex.Infrastructure;
using CourierAmex.Models;
using EmailQueueStatus = CourierAmex.Models.EmailQueueStatus;

namespace CourierAmex.Services
{
	public class AuthenticationService : IAuthenticationService
	{
		private readonly IUserRepository _repository;
		private readonly ICompanyRepository _companyRepository;
		private readonly IEmailQueueService _emailQueueService;
		private readonly JwtAuthService _jwtAuthService;
		private readonly IDalSession _session;
		private readonly IMapper _mapper;

		public AuthenticationService(IMapper mapper, IUserRepository repository, ICompanyRepository companyRepository, IEmailQueueService emailQueueService, IDalSession session, JwtAuthService jwtAuthService)
		{
			_mapper = mapper;
			_repository = repository;
			_companyRepository = companyRepository;
			_emailQueueService = emailQueueService;
			_session = session;
			_jwtAuthService = jwtAuthService;
		}

		public async Task<GenericResponse<LoginResponse>> ValidateLoginAsync(LoginRequest request, string ipAddress)
		{
			GenericResponse<LoginResponse> result = new();
			var existingUser = await _repository.LoginAsync(request.Email);
			if (null != existingUser)
			{
				CustomPasswordHasher hasher = new();
				var passwordHash = existingUser.PasswordHash ?? "";
				if (hasher.VerifyPassword(passwordHash, request.Password))
				{
					existingUser.LastIPAddress = ipAddress;
					existingUser.LastLoginDate = DateTime.UtcNow;

					await _repository.UpdateLoginDateAsync(existingUser);

					_session.GetUnitOfWork().CommitChanges();

					var permissions = await _repository.GetPermissionsAsync(existingUser.Id);

					var user = _mapper.Map<User, UserModel>(existingUser);
					user.Permissions = _mapper.Map<IEnumerable<PermissionModel>>(permissions);

					if (existingUser.CompanyId > 0) {
						var company = await _companyRepository.GetByIdAsync(existingUser.CompanyId);
						if (company != null) {
							user.Company = _mapper.Map<Company, CompanyModel>(company);
						}
					}

					StringBuilder builder = new();
					var claims = BuildClaims(user, builder.ToString());
					var loginResponse = new LoginResponse
					{
						User = user,
						AccessToken = _jwtAuthService.BuildToken(claims),
						RefreshToken = _jwtAuthService.BuildRefreshToken()
					};

					result.Success = true;
					result.Data = loginResponse;
				}
			}

			return result;
		}

		public async Task<GenericResponse<LoginResponse>> RefreshToken(string accessToken)
		{
			GenericResponse<LoginResponse> result = new();
			ClaimsPrincipal? claimsPrincipal = _jwtAuthService.GetPrincipalFromToken(accessToken);
			if (claimsPrincipal == null) return result;

			string id = claimsPrincipal.Claims.First(c => c.Type == "id").Value;
			var existingUser = await _repository.GetByIdAsync(Guid.Parse(id));
			if (existingUser == null) return result;

			var permissions = await _repository.GetPermissionsAsync(existingUser.Id);

			var user = _mapper.Map<User, UserModel>(existingUser);
			user.Permissions = _mapper.Map<IEnumerable<PermissionModel>>(permissions);

			StringBuilder builder = new();
			var claims = BuildClaims(user, builder.ToString());
			var loginResponse = new LoginResponse
			{
				User = user,
				AccessToken = _jwtAuthService.BuildToken(claims),
				RefreshToken = _jwtAuthService.BuildRefreshToken()
			};

			result.Success = true;
			result.Data = loginResponse;

			return result;
		}

		public async Task<GenericResponse<bool>> ForgotAsync(ForgotRequest request)
		{
			GenericResponse<bool> result = new();
			var existingUser = await _repository.LoginAsync(request.Email);
			if (null != existingUser)
			{
				existingUser.ResetKey = Guid.NewGuid();
				existingUser.ResetKeyExpireDate = DateTime.Now.AddHours(24);

				await _repository.UpdateResetKeyAsync(existingUser);
				await SendForgotEmailAsync(existingUser);

				_session.GetUnitOfWork().CommitChanges();

				result.Success = true;
			}

			return result;
		}

		public async Task<GenericResponse<UserModel>> GetUserByResetKeyAsync(string resetKey)
		{
			GenericResponse<UserModel> result = new();
			var existingUser = await _repository.GetByResetKeyAsync(resetKey);
			if (null != existingUser)
			{
				if (!existingUser.ResetKeyExpireDate.HasValue)
				{
					result.Error = "Error.NoExpireDate";
					return result;
				}

				var expireDate = existingUser.ResetKeyExpireDate.Value - DateTime.Now;
				if (expireDate.TotalHours > 24)
				{
					result.Error = "Error.ExpiredResetKey";
					return result;
				}

				result.Data = _mapper.Map<UserModel>(existingUser);
				result.Success = true;
			}

			return result;
		}

		public async Task<GenericResponse<bool>> ResetPasswordAsync(ResetRequest request)
		{
			GenericResponse<bool> result = new();
			var existingUser = await _repository.GetByIdAsync(Guid.Parse(request.UserId));
			if (null != existingUser)
			{
				CustomPasswordHasher hasher = new();
				existingUser.PasswordHash = hasher.HashPassword(request.Password);

				await _repository.UpdatePasswordAsync(existingUser);

				_session.GetUnitOfWork().CommitChanges();

				result.Success = true;
			}

			return result;
		}

		private static Claim[] BuildClaims(UserModel user, string role)
		{
			//User is Valid
			var claims = new[]
			{
				new Claim("id",user.Id),
				new Claim("name",user.Email),
				new Claim("sub",role)
            };

			return claims;
		}

		private async Task SendForgotEmailAsync(User user)
		{
			string templatePath = Path.Combine(Environment.CurrentDirectory, "email-templates", "forgot-password.html");
			if (!File.Exists(templatePath))
			{
				throw new FileNotFoundException("Email template was not found.");
			}

			string htmlText = File.ReadAllText(templatePath);
			if (htmlText == null || htmlText.Length == 0)
			{
				throw new FileNotFoundException("Email template was not found.");
			}

			htmlText = htmlText.Replace("[USERNAME]", string.Concat(user.Name, " ", user.Lastname));
			htmlText = htmlText.Replace("[RESETLINK]", string.Concat("?key=", HttpUtility.UrlEncode(user.ResetKey.ToString())));

			var emailBody = new EmailBody
			{
				Title = "Reset Password",
				Subject = "Request to reset password",
				Text = htmlText,
				IsHtml = true,
				Status = EmailQueueStatus.Pending
			};

			string toAddress = user.Email ?? "";
			await _emailQueueService.CreateAsync(toAddress, emailBody);
		}
	}
}
