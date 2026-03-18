using System.Net.Mail;

using MimeKit;
using MailKit.Security;

using CourierAmex.Models;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;

using SystemSettingEnum = CourierAmex.Storage.Enums.SystemSetting;
using AttachmentType = CourierAmex.Models.AttachmentType;

namespace CourierAmex.Services
{
    public class EmailQueueService : IEmailQueueService
    {
        private readonly IEmailQueueRepository _repository;
        private readonly ISystemSettingRepository _systemSettingRepository;
        private readonly ILogger<JwtAuthService> _logger;

        public EmailQueueService(
            IEmailQueueRepository repository,
            ISystemSettingRepository systemSettingRepository,
            ILogger<JwtAuthService> logger)
        {
            _repository = repository;
            _systemSettingRepository = systemSettingRepository;
            _logger = logger;
        }

        public async Task CreateAsync(string toAddress, EmailBody body)
        {
            if (string.IsNullOrEmpty(toAddress)) return;

            EmailQueue entity = new()
            {
                ToAddress = toAddress,
                Subject = body.Subject,
                EmailTitle = body.Title,
                EmailBody = body.Text,
                IsHtml = body.IsHtml,
                HasAttachment = body.HasAttachment,
                Attachment = body.Attachment,
                AttachmentType = (byte)body.AttachmentType,
                Status = (byte)body.Status
            };

            await _repository.CreateAsync(entity);
        }

        public async Task<IEnumerable<EmailQueue>> GetByStatusAsync(byte status)
        {
            return await _repository.GetByStatusAsync(status);
        }

        public async Task MarkEmailAsErrorAsync(EmailQueue request)
        {
            await _repository.MarkEmailAsErrorAsync(request);
        }

        public async Task MarkEmailAsSendAsync(EmailQueue request)
        {
            await _repository.MarkEmailAsSentAsync(request);
        }

        public async Task SendEmailAsync(string toAddress, EmailBody? body = null)
        {
            EmailConfiguration _emailConfig = await LoadSettings() ?? throw new NullReferenceException("Email Configuration not found.");
            bool IsEnable = _emailConfig.IsEnable ?? false;

            if (body == null) throw new ArgumentNullException("body");

            if (IsEnable)
            {
                if (string.IsNullOrEmpty(toAddress))
                    throw new ArgumentNullException(toAddress);

                var emailMessage = new MimeMessage
                {
                    Sender = new MailboxAddress(_emailConfig.SendersName, _emailConfig.SmtpUserName),
                    Subject = body.Subject
                };
                emailMessage.From.Add(new MailboxAddress(_emailConfig.EmailDisplayName, _emailConfig.SmtpUserName));

                var testAddresses = Array.Empty<string>();
                if (_emailConfig.TestEmailAddress != null && _emailConfig.TestEmailAddress.Length > 0)
                {
                    testAddresses = _emailConfig.TestEmailAddress.Split(";");
                }

                List<string> toAddressList = new List<string>();
                if (_emailConfig.IsProduction.HasValue && _emailConfig.IsProduction.Value)
                {
                    toAddressList.Add(toAddress);
                }
                else
                {
                    foreach (var address in testAddresses)
                    {
                        toAddressList.Add(address.Replace(";", ""));
                    }
                }

                foreach (var to in toAddressList)
                {
                    emailMessage.To.Add(new MailboxAddress(to, to));
                }

                var builder = new BodyBuilder
                {
                    TextBody = body.Text,
                    HtmlBody = body.IsHtml ? body.Text : ""
                };

                if (body.HasAttachment && body.AttachmentType == AttachmentType.PDF && !string.IsNullOrEmpty(body.Attachment))
                {
                    var file = Convert.FromBase64String(body.Attachment);
                    using var ms = new MemoryStream(file);
                    ms.Position = 0;
                    builder.Attachments.Add("budget.pdf", ms);
                }
                emailMessage.Body = builder.ToMessageBody();

                try
                {
                    var smtpPort = _emailConfig.SmtpServerPort ?? 0;
                    using var smtp = new MailKit.Net.Smtp.SmtpClient();
                    var socketOption = (_emailConfig.EnableSsl.HasValue && _emailConfig.EnableSsl.Value) ? SecureSocketOptions.StartTls : SecureSocketOptions.Auto;
                    await smtp.ConnectAsync(_emailConfig.SmtpServer, 587, socketOption);
                    
                    if (!string.IsNullOrEmpty(_emailConfig.SmtpUserName))
                    {
                        await smtp.AuthenticateAsync(_emailConfig.SmtpUserName, _emailConfig.SmtpPassword);
                    }

                    await smtp.SendAsync(emailMessage);
                    await smtp.DisconnectAsync(true);
                }
                catch (SmtpException ex)
                {
                    _logger.LogError("ERROR!!!", ex.Message);
                }
            }
        }

        public async Task<EmailConfiguration> LoadSettings()
        {
            var _emailConfiguration = new EmailConfiguration();
            var settings = await _systemSettingRepository.GetAllAsync();
            if (settings != null && settings.Any())
            {
                var emailEnable = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.Email_Enable.ToDescriptionString());
                var smtpServer = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.Email_SmtpServer.ToDescriptionString());
                var smtpServerPort = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.Email_SmtpServerPort.ToDescriptionString());
                var enableSSL = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.Email_EnableSsl.ToDescriptionString());
                var displayName = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.Email_EmailDisplayName.ToDescriptionString());
                var username = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.Email_SmtpUserName.ToDescriptionString());
                var password = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.Email_SmtpPassword.ToDescriptionString());
                var sendersName = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.Email_SendersName.ToDescriptionString());
                var isProduction = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.Email_IsProduction.ToDescriptionString());
                var testEmail = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.Email_TestEmailAddress.ToDescriptionString());
                var webUrl = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.General_WebUrl.ToDescriptionString());
                var appName = settings.FirstOrDefault(s => s.Id == SystemSettingEnum.General_AppName.ToDescriptionString());

                _emailConfiguration.EmailDisplayName = displayName != null ? displayName.Value : "";
                _emailConfiguration.EnableSsl = enableSSL != null && enableSSL.Value == "True";
                _emailConfiguration.SendersName = sendersName != null ? sendersName.Value : "";
                _emailConfiguration.SmtpPassword = password != null ? password.Value : "";
                _emailConfiguration.SmtpServer = smtpServer != null ? smtpServer.Value : "";
                _emailConfiguration.SmtpServerPort = smtpServerPort != null && smtpServerPort.Value != null ? int.Parse(smtpServerPort.Value) : 0;
                _emailConfiguration.SmtpUserName = username != null ? username.Value : "";
                _emailConfiguration.TestEmailAddress = testEmail != null ? testEmail.Value : "";
                _emailConfiguration.IsEnable = emailEnable != null && emailEnable.Value == "True";
                _emailConfiguration.IsProduction = isProduction != null && isProduction.Value == "True";
                _emailConfiguration.WebUrl = webUrl != null ? webUrl.Value : "";
                _emailConfiguration.AppName = appName != null ? appName.Value : "";
            }

            return _emailConfiguration;
        }
    }
}
