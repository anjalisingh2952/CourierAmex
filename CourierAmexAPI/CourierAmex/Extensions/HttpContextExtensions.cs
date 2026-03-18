using System.Net;
using System.Security.Claims;

using CourierAmex.Infrastructure;

namespace CourierAmex.Extensions
{
    public static class HttpContextExtensions
    {
        public static IPAddress? GetRemoteIPAddress(this HttpContext context, bool allowForwarded = true)
        {
            if (allowForwarded)
            {
                string ctxIp = context.Request.Headers["CF-Connecting-IP"].FirstOrDefault() ?? "";
                ctxIp = string.IsNullOrEmpty(ctxIp) ? context.Request.Headers["X-Forwarded-For"].FirstOrDefault() ?? "" : "";
                if (IPAddress.TryParse(ctxIp, out IPAddress? ip))
                {
                    return ip;
                }
            }

            return context.Connection.RemoteIpAddress;
        }

        public static WorkContext? GetWorkContext(this HttpContext context)
        {
            WorkContext? reply = null;
            var userInfo = context.User;
            if (null != userInfo.Claims && userInfo.Claims.Any())
            {
                List<Claim> claimsPrincipal = userInfo.Claims.ToList();
                string userId = claimsPrincipal.First(c => c.Type == "id").Value;
                reply = new WorkContext(userId);
            }

            return reply;
        }
    }
}
