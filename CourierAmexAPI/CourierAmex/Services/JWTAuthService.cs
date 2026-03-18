using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

using Microsoft.IdentityModel.Tokens;

using CourierAmex.Infrastructure;

namespace CourierAmex.Services
{
	public sealed class JwtAuthService
	{
		private readonly JwtSettings _config;
		private readonly ILogger<JwtAuthService> _logger;

		public JwtAuthService(JwtSettings config, ILogger<JwtAuthService> logger)
		{
			_config = config;
			_logger = logger;
		}

		public string BuildToken(Claim[] claims)
		{
			if (string.IsNullOrEmpty(_config.IssuerSigningKey))
				throw new ArgumentNullException(_config.IssuerSigningKey);

			var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.IssuerSigningKey));
			var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

			var token = new JwtSecurityToken(
					issuer: _config.ValidIssuer,
					audience: _config.ValidAudience,
					notBefore: DateTime.Now,
					claims: claims,
					expires: DateTime.Now.AddMinutes(_config.AccessTokenExpiration),
					signingCredentials: credentials);

			return new JwtSecurityTokenHandler().WriteToken(token);
		}

		public string BuildRefreshToken()
		{
			var randomNumber = new byte[32];
			using (var randomNumberGenerator = RandomNumberGenerator.Create())
			{
				randomNumberGenerator.GetBytes(randomNumber);
				return Convert.ToBase64String(randomNumber);
			}
		}

		public ClaimsPrincipal? GetPrincipalFromToken(string token)
		{
			JwtSecurityTokenHandler tokenValidator = new();
			var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config.IssuerSigningKey ?? ""));

			var parameters = new TokenValidationParameters
			{
				ValidateAudience = false,
				ValidateIssuer = false,
				ValidateIssuerSigningKey = true,
				IssuerSigningKey = key,
				ValidateLifetime = false
			};

			try
			{
				var principal = tokenValidator.ValidateToken(token, parameters, out var securityToken);

				if (securityToken is not JwtSecurityToken jwtSecurityToken || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
				{
					_logger.LogError("Token validation failed");
					return null;
				}

				return principal;
			}
			catch (Exception e)
			{
				_logger.LogError("Token validation failed", e.Message);
				return null;
			}
		}
	}
}
