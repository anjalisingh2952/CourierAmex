using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage;
using CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Authorization;
using Neodynamic.SDK.Printing;
using Microsoft.AspNetCore.Mvc;
using DocumentFormat.OpenXml.Vml;
using Neodynamic.SDK.ZPLPrinter;
using System.Drawing;
using ClosedXML.Excel;
using DocumentFormat.OpenXml.Spreadsheet;
using DocumentFormat.OpenXml.Vml.Spreadsheet;

namespace CourierAmex.Controllers.v1
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class PaymentController : ControllerBase
    {
        public readonly IPaymentService _service;
        private readonly ILogger<PaymentController> _logger;
        private readonly IInvoiceGenerateService _generateService;
        private readonly IServiceProvider _serviceProvider;
        private readonly IEmailQueueService _emailQueueService;
        private readonly IDalSession _session;
        private HttpContext _ctx;
        private const string PrinterName = "Zebra LP 2844";
        private const string LabelPath = @"C:\Temp\Label.png";

        public PaymentController(ILogger<PaymentController> logger, IPaymentService service,IInvoiceGenerateService invoiceGenerateService, IEmailQueueService emailQueueService
            , IServiceProvider serviceProvider, IDalSession session)
        {
            _generateService = invoiceGenerateService;
            _logger = logger;
            _service = service;
            _serviceProvider = serviceProvider;
            _emailQueueService = emailQueueService;
            _session = session;
        }

        /// <summary>
        /// Gets the list of invoices for a given customer ID, within the specified date range and optional filters.
        /// </summary>
        /// <param name="clientId">The customer/client ID for whom invoices are being retrieved.</param>
        /// <param name="fromDate">Start date for filtering invoices (format: yyyy-MM-dd).</param>
        /// <param name="toDate">End date for filtering invoices (format: yyyy-MM-dd).</param>
        /// <param name="filters">Additional filters (e.g., status, invoice type).</param>
        /// <param name="pageNumber">Page number for pagination (optional).</param>
        /// <param name="pageSize">Page size for pagination (optional).</param>
        /// <returns>
        /// Returns a list of invoices if pagination is not provided. 
        /// If pagination parameters are provided, returns paginated invoices along with total row count.
        /// </returns>
        /// <response code="200">Returns the invoices successfully</response>
        /// <response code="400">If an error occurs during processing</response>


        #region Get Methods
        [HttpGet("GetDeliveryProofDetail")]
        public async Task<GenericResponse<SignaturePackageResponseModel>> GetDeliveryProofDetail(int packageNumber)
        {
            var response = new GenericResponse<SignaturePackageResponseModel>();
            var entities = await _service.GetSignaturePackage(packageNumber);
            if (entities != null)
            {
                response.Success = true;
                response.Data = entities;
            }
            else
            {
                response.Success = false;
                response.Message = "No records found";
            }

            return response;
        }

        /// <summary>
        /// Gets the list of pending invoices for a given customer ID.
        /// </summary>
        /// <param name="clientId">The customer/client ID for whom pending invoices are to be retrieved.</param>
        /// <returns>
        /// A list of pending invoices for the specified client.
        /// </returns>
        /// <response code="200">Returns the pending invoices successfully</response>
        /// <response code="400">If an error occurs during processing</response>
        [HttpGet("PrepareDeliveryProof")]
        public async Task<IActionResult> PrepareDeliveryProofHtml([FromQuery] int packageNumber)
        {
            try
            {
                var entity = await GetDeliveryProofDetail(packageNumber);
                if (entity == null || entity.Data.PackageNumber == 0)
                {
                    return NoContent();
                }


                string invoiceHtml = await _generateService.PrepareDeliveryProofHtmlAsync(entity.Data);
                var pdfResult = await _generateService.GeneratePdfFromHtmlAsync(invoiceHtml);

                string base64Pdf = Convert.ToBase64String(pdfResult.FileContents);

                return Ok(new
                {
                    PdfBase64 = base64Pdf,
                    Customer = entity.Data.Customer,
                    HtmlTemplate = invoiceHtml
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        #endregion

        #region Post Methods

        [HttpPost("SendEmail")]
        public async Task<IActionResult> SendEmail([FromBody] EmailRequest req)
        {
            try
            {
                EmailBody emailBody = new EmailBody()
                {
                    Title = "Delivery Proof",
                    Subject = "Delivery Proof",
                    Text = req.HtmlTemplate,
                    IsHtml = true,
                    Status = EmailQueueStatus.Pending
                };

                using var scope = _serviceProvider.CreateScope();

                EmailQueue emailQueue = new EmailQueue()
                {
                    EmailBody = req.HtmlTemplate,
                    CreatedAt = DateTime.Now,
                    Attachment = null,
                    IsHtml = true,
                    ToAddress = req.Email,
                    Status = 1,
                    EmailTitle = emailBody.Title,
                    Subject = emailBody.Subject,
                };

                await _service.ProcessEmail(scope, req.HtmlTemplate, emailQueue);

                _session.GetUnitOfWork().CommitChanges();

                return Ok(new { status = 200, message = "Email queued successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while sending email");
                return StatusCode(500, new { status = 500, message = "An error occurred while sending the email", error = ex.Message });
            }
        }

        #endregion

        [HttpGet("GetPointOfSale")]
        public async Task<IActionResult> GetPointOfSale([FromQuery] int CompanyId, [FromQuery] string User, [FromQuery] int State)
        {
            try
            {
                var pointOfSale = await _service.GetPointOfSale(CompanyId, User, State);

                if (pointOfSale == null)
                {
                    return NotFound("No Point of Sale found.");
                }

                return Ok(pointOfSale);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }


        [HttpGet("GetPointOfSaleDailySummary")]
        public async Task<IActionResult> GetPointOfSaleDailySummary([FromQuery] int CompanyId, [FromQuery] int OpeningCode)
        {
            try
            {
                var detail = await _service.GetPointOfSaleDailySummary(CompanyId, OpeningCode);

                if (detail == null)
                {
                    return NotFound("No Point of Sale found.");
                }

                return Ok(detail);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }


        [HttpGet("StartPointOfSale")]
        public async Task<IActionResult> StartPointOfSale([FromQuery] int companyId, [FromQuery] string user, [FromQuery] int pointOfSaleId, [FromQuery] int inDollars,[FromQuery] int inLocal)
        {
            try
            {
                var pointOfSale = await _service.StartPointOfSale(companyId, user, pointOfSaleId, inDollars, inLocal);

                if (pointOfSale == null)
                {
                    return NotFound("No Point of Sale found.");
                }

                return Ok(pointOfSale);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }

        [HttpGet("CashInOut")]
        public async Task<IActionResult> CashInOut([FromQuery] int companyId, [FromQuery] string user, [FromQuery] int pointOfSaleId, [FromQuery] int inDollars, [FromQuery] int inLocal, [FromQuery] int openingId)
        {
            try
            {
                var pointOfSale = await _service.CashInOut(companyId, user, pointOfSaleId, inDollars, inLocal, openingId);

                if (pointOfSale == null)
                {
                    return NotFound("No Point of Sale found.");
                }

                return Ok(pointOfSale);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }

        [HttpGet("GetSubPaymentTypeByPaymentId")]
        public async Task<IActionResult> GetSubPaymentTypeByPaymentId([FromQuery] int companyId, [FromQuery] int paymentId, [FromQuery] int pointOfSaleId)
        {
            try
            {
                var subPaymentType = await _service.GetSubPaymentTypeByPaymentId(companyId, paymentId,pointOfSaleId);

                if (subPaymentType == null)
                {
                    return NotFound("No Point of Sale found.");
                }

                return Ok(subPaymentType);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }

        [HttpGet("GetPaymentType")]
        public async Task<IActionResult> GetPaymentType([FromQuery] int companyId)
        {
            try
            {
                var paymentType = await _service.GetPaymentType(companyId);

                if (paymentType == null)
                {
                    return NotFound("No Point of Sale found.");
                }

                return Ok(paymentType);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }

        [HttpGet("ClosePointOfSale")]
        public async Task<IActionResult> ClosePointOfSale([FromQuery] int openingId)
        {
            try
            {
                var paymentType = await _service.ClosePointOfSale(openingId);

                if (paymentType == null)
                {
                    return NotFound("No Point of Sale found.");
                }

                return Ok(paymentType);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }

        [HttpGet("GetPointOfDetailByOpeningCode")]
        public async Task<IActionResult> GetPointOfDetailByOpeningCode([FromQuery] int companyId, [FromQuery] int? OpeningCode, [FromQuery] int? pointOfSaleId, [FromQuery] DateTime? ChooseDate)
        {
            try
            {
                var payments = await _service.GetPointOfDetailByOpeningCode(companyId,OpeningCode, pointOfSaleId, ChooseDate);

                if (payments == null)
                {
                    return NotFound("No Point of Sale found.");
                }

                return Ok(payments);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }

        [HttpGet("PaymentForInvoices")]
        public async Task<IActionResult> PaymentForInvoices([FromQuery] int customerId, [FromQuery] string invoiceCSV, [FromQuery] double localAmount, [FromQuery] double dollarAmount, [FromQuery] double paidAmount, [FromQuery] double changeAmount, [FromQuery] int currencyCode,
        [FromQuery] string paymentType, [FromQuery] int subPaymentTypeId, [FromQuery] string? reference, [FromQuery] int pointOfSaleId, [FromQuery] int companyId, [FromQuery] bool partialPayment, [FromQuery] bool creditPayment, [FromQuery] string user)
        {
            try
            {
                var paymentID = await _service.PaymentForInvoices(customerId, invoiceCSV, localAmount, dollarAmount, paidAmount, changeAmount, currencyCode,
                paymentType, subPaymentTypeId, reference??"", pointOfSaleId, companyId, partialPayment, creditPayment, user);

                if (paymentID == null)
                {
                    return NotFound("No Point of Sale found.");
                }

                return Ok(paymentID);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }

        [HttpPost("CancelPayment")]
        public async Task<IActionResult> CancelPayment([FromQuery] int CompanyId, [FromQuery] int PaymentId, [FromQuery] string UserId)
        {
            try {
                var result = await _service.CancelPayment(CompanyId, PaymentId, UserId);
                    
                return Ok(result);
            }
            catch(Exception ex)
            {
                Console.WriteLine(ex.Message);
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }

        [HttpGet("GetPointOfSaleDailyExcelReport")]
        public async Task<IActionResult> GetPointOfSaleDailyExcelReport([FromQuery] int companyId,[FromQuery] int? openingCode,[FromQuery] int? pointOfSaleId,[FromQuery] DateTime? chooseDate) 
        {
            try
            {
                var fileContent = await _service.GetPointOfSaleDailyExcelReport(companyId, openingCode, pointOfSaleId, chooseDate);

                if (fileContent == null || fileContent.Length == 0)
                {
                    return NotFound("No data found or template file missing.");
                }

                return File(fileContent, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "PointOfSaleDailyReport.xlsx");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message} | StackTrace: {ex.StackTrace}");
                return StatusCode(500, "Internal Server Error. Please try again later.");
            }
        }


    }
}