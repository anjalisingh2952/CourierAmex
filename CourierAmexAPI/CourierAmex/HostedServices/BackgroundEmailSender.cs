using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Storage;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Repositories;

using AttachmentType = CourierAmex.Models.AttachmentType;
using EmailQueueStatus = CourierAmex.Models.EmailQueueStatus;

namespace CourierAmex.HostedServices
{
    public class BackgroundEmailSender : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BackgroundEmailSender> _logger;

        public BackgroundEmailSender(IServiceProvider serviceProvider, ILogger<BackgroundEmailSender> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("BackgroundEmailSender background started.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var emails = await GetPendingEmails();
                    if (null != emails && emails.Count > 0)
                    {
                        string baseTemplate = string.Empty;
                        string bodyTemplatePath = Path.Combine(Environment.CurrentDirectory, "email-templates", "body-template.html");
                        baseTemplate = File.ReadAllText(bodyTemplatePath);

                        if (!string.IsNullOrEmpty(baseTemplate))
                        {
                            foreach (var email in emails)
                            {
                                using var scope = _serviceProvider.CreateScope();
                                await ProcessEmail(scope, baseTemplate, email);
                            }
                        } else {
                            throw new InvalidOperationException("Email Body template is missing");
                        }
                    }

                    await Task.Delay(60 * 1000, stoppingToken);
               }
                catch (OperationCanceledException)
                {
                    //We need to terminate the delivery, so we'll just break the while loop
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Couldn't execute BackgroundEmailSender task.");
                    await Task.Delay(5000, stoppingToken);
                }
            }

            _logger.LogInformation("BackgroundEmailSender background stopped.");
        }

        private static async Task ProcessEmail(IServiceScope scope, string baseTemplate, EmailQueue email)
        {
            var year = DateTime.Now.Year;
            var session = scope.ServiceProvider.GetRequiredService<IDalSession>();
            var emailQueueService = scope.ServiceProvider.GetRequiredService<IEmailQueueService>();

            try
            {
                var settings = await emailQueueService.LoadSettings();
                if (settings == null) return;
                if (string.IsNullOrEmpty(email.ToAddress))
                    throw new ArgumentNullException(email.ToAddress);

                var emailText = baseTemplate.Replace("[APPNAME]", settings.AppName);
                emailText = emailText.Replace("[TITLE]", email.EmailTitle);
                emailText = emailText.Replace("[EMAILBODY]", email.EmailBody);
                emailText = emailText.Replace("[WEBSITEURL]", settings.WebUrl);
                emailText = emailText.Replace("[COPYRIGHT]", "COPYRIGHT &COPY; " + year.ToString());
                emailText = emailText.Replace("[YEAR]", year.ToString());

                var emailBody = new EmailBody
                {
                    Subject = email.Subject,
                    Text = emailText,
                    IsHtml = email.IsHtml,
                    HasAttachment = email.HasAttachment,
                    Attachment = email.Attachment,
                    AttachmentType = (AttachmentType)email.AttachmentType
                };

                await emailQueueService.SendEmailAsync(email.ToAddress, emailBody);

                email.Status = (byte)EmailQueueStatus.Send;
                await emailQueueService.MarkEmailAsSendAsync(email);
            }
            catch (Exception ex)
            {
                email.Status = (byte)EmailQueueStatus.Error;
                email.Error = ex.Message;
                await emailQueueService.MarkEmailAsErrorAsync(email);
            }

            session.GetUnitOfWork().CommitChanges();
        }

        private async Task<List<EmailQueue>> GetPendingEmails()
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                using (IDalSession session = scope.ServiceProvider.GetService<IDalSession>())
                {
                    IEmailQueueRepository repository = new EmailQueueRepository(session);
                    return new List<EmailQueue>(await repository.GetByStatusAsync((byte)EmailQueueStatus.Pending));
                }
            }
        }
    }
}
