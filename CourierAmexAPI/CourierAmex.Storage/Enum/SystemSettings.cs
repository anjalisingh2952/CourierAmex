using System.ComponentModel;

namespace CourierAmex.Storage.Enums
{
    public enum SystemSetting
    {
        [Description("Email_Enable")]
        Email_Enable,
        [Description("Email_SmtpServer")]
        Email_SmtpServer,
        [Description("Email_SmtpServerPort")]
        Email_SmtpServerPort,
        [Description("Email_EnableSsl")]
        Email_EnableSsl,
        [Description("Email_EmailDisplayName")]
        Email_EmailDisplayName,
        [Description("Email_SmtpUserName")]
        Email_SmtpUserName,
        [Description("Email_SmtpPassword")]
        Email_SmtpPassword,
        [Description("Email_SendersName")]
        Email_SendersName,
        [Description("Email_IsProduction")]
        Email_IsProduction,
        [Description("Email_TestEmailAddress")]
        Email_TestEmailAddress,
        [Description("General_WebUrl")]
        General_WebUrl,
        [Description("General_AppName")]
        General_AppName
    }

    public static class SystemSettingsExtensions
    {
        public static string ToDescriptionString(this SystemSetting val)
        {
            var type = val.GetType() ?? throw new ArgumentNullException(nameof(val));
            var field = type.GetField(val.ToString()) ?? throw new ArgumentNullException(nameof(val));

            DescriptionAttribute[] attributes = (DescriptionAttribute[])field
              .GetCustomAttributes(typeof(DescriptionAttribute), false);
            return attributes.Length > 0 ? attributes[0].Description : string.Empty;
        }

    }
}
