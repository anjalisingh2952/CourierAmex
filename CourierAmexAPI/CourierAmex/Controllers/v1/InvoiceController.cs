using ClosedXML.Excel;
using CourierAmex.Models;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CourierAmex.Controllers.v1
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class InvoiceController : Controller
    {
        private readonly ILogger<InvoiceController> _logger;
        private readonly IInvoiceService _service;
        private readonly IInvoiceGenerateService _generateService;
        public InvoiceController(ILogger<InvoiceController> logger, IInvoiceService service, IInvoiceGenerateService generateService)
        {
            _logger = logger;
            _service = service;
            _generateService = generateService;
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
        [HttpGet("CustomerDetailsByClientId")]
        public async Task<IActionResult> GetDocumentByCustomer([FromQuery] string clientId, [FromQuery] string fromDate, [FromQuery] string toDate, [FromQuery] string filters, [FromQuery] int? pageNumber = null, [FromQuery] int? pageSize = null)
        {
            try
            {
                var result = await _service.GetDocumentByCustomerAsync(clientId, fromDate, toDate, filters, pageNumber, pageSize);

                bool isPageSizeNull = pageSize == null;
                bool isPageNumberNull = pageNumber == null;

                if (isPageSizeNull && isPageNumberNull)
                {
                    var response = new GenericResponse<IEnumerable<Invoice>>
                    {
                        Success = true,
                        Message = "Invoices fetched successfully",
                        Data = result.Data.invoices
                    };
                    return Ok(response);
                }
                else
                {
                    var response = new GenericResponse<object>
                    {
                        Success = true,
                        Message = "Invoices and total row count fetched successfully",
                        Data = new
                        {
                            Invoices = result.Data.invoices,
                            TotalRows = result.Data.totalRows
                        }
                    };
                    return Ok(response);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'CustomerDetailsByClientId' invocation: {Message}", ex.Message);

                var errorResponse = new GenericResponse<string>
                {
                    Success = false,
                    Message = "Error fetching invoice data",
                    Data = null
                };
                return StatusCode(400, errorResponse);
            }
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
        [HttpGet("InvoicesPendingByCustomer")]
        public async Task<IActionResult> InvoicesPendingByCustomer([FromQuery] string clientId)
        {
            GenericResponse<IEnumerable<InvoiceModel>> response;
            try
            {
                response = await _service.InvoicesPendingByCustomer(clientId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'InvoicesPendingByCustomer' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("InsertCreditNote")]
        public async Task<IActionResult> InsertCreditNote([FromBody] CreditNoteInsertRequestModel request)
        {
            GenericResponse<int> response = new GenericResponse<int>();

            try
            {
                response = await _service.InsertCreditNote(request);

                if (response.Success)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(response.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'InsertCreditNote' invocation.", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("CancelInvoice")]
        public async Task<IActionResult> CancelInvoice([FromQuery] int companyId, [FromQuery] int invoiceId, [FromQuery] string userId)
        {
            GenericResponse<int> response = new GenericResponse<int>();

            try
            {
                response = await _service.CancelInvoice(companyId, invoiceId, userId);
                if (response.Success)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(response.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'InsertCreditNote' invocation.", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("GenerateAccountingEntry")]
        public async Task<IActionResult> GenerateAccountingEntry([FromQuery] int companyId, [FromQuery] string periodDate, [FromQuery] string entryDate, [FromQuery] string entryDescription, [FromQuery] string statusIndicator, [FromQuery] string sourceSystemCode, [FromQuery] string systemIndicator, [FromQuery] string inclusionDate, [FromQuery] int inclusionUser)
        {
            GenericResponse<string> response = new GenericResponse<string>();

            try
            {
                response = await _service.GenerateAccountingEntry(companyId, periodDate, entryDate, entryDescription, statusIndicator, sourceSystemCode, "", inclusionDate, inclusionUser);
                if (response.Success)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(response.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'InsertCreditNote' invocation.", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("GenerateAccountingEntryInvoice")]
        public async Task<IActionResult> GenerateAccountingEntryInvoice([FromQuery] int companyId, [FromQuery] string entryCode, [FromQuery] int invoiceNumber)
        {
            GenericResponse<int> response = new GenericResponse<int>();

            try
            {
                response = await _service.GenerateAccountingEntryInvoice(companyId, entryCode, invoiceNumber);
                if (response.Success)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(response.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'InsertCreditNote' invocation.", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("SelectTemplateAccount")]
        public async Task<IActionResult> SelectTemplateAccount([FromQuery] int companyId, [FromQuery] string moduleCode, [FromQuery] int templateCode)
        {
            GenericResponse<IEnumerable<TemplateAccountModel>> response = new GenericResponse<IEnumerable<TemplateAccountModel>>();

            try
            {
                response = await _service.SelectTemplateAccount(companyId, moduleCode, templateCode);
                if (response.Success)
                {
                    return Ok(response);
                }
                else
                {
                    return BadRequest(response.Message);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'InsertCreditNote' invocation.", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpPost("InsertAccountingDetail")]
        public async Task<IActionResult> InsertAccountingDetail([FromBody] List<AccountingDetail> accountingDetails)
        {
            var responses = new List<GenericResponse<int>>();

            try
            {
                foreach (var detail in accountingDetails)
                {
                    var response = await _service.InsertAccountingDetail(detail);
                    responses.Add(response);

                    if (!response.Success)
                    {
                        _logger.LogWarning("Insert failed for EntryCode: {EntryCode}, Message: {Message}", detail.EntryCode, response.Message);
                        return BadRequest(new { Message = response.Message, FailedEntry = detail });
                    }
                }

                return Ok(responses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "There was an error on 'InsertAccountingDetail' invocation.");
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("GetPackagesByInvoice")]
        public async Task<IActionResult> GetPackagesByInvoice([FromQuery] int invoiceNumber)
        {
            GenericResponse<IEnumerable<InvoiceDetailsModel>> response;
            try
            {
                response = await _service.GetPackagesByInvoice(invoiceNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetPackagesByInvoice' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("FullInvoiceDetailsById")]
        public async Task<IActionResult> GetFullInvoiceDetailsById(int invoiceId)
        {
            try
            {
                var invoiceDetails = await _service.GetInvoiceInfoDetailByIdAsync(invoiceId);
                if (invoiceDetails == null || !invoiceDetails.Success)
                {
                    return StatusCode(500, "Error retrieving Invoice Details.");
                }
                var invoiceInfo = await _service.GetInvoiceInfoByIdAsync(invoiceId);
                if (invoiceInfo == null)
                {
                    return StatusCode(500, "Error retrieving Invoice Info.");
                }
                var result = new
                {
                    InvoiceInfo = invoiceInfo,
                    InvoiceDetails = invoiceDetails.Data
                };
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'FullInvoiceDetailsById' invocation.", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("GetFullPaymentDetailsById")]
        public async Task<IActionResult> GetFullPaymentDetailsById(int paymentId, int invoiceNumber)
        {
            try
            {
                var paymentInfo = await _service.GetPaymentInfoById(paymentId, invoiceNumber);
                if (paymentInfo == null)
                {
                    return StatusCode(500, "Error retrieving Invoice Info.");
                }

                var result = new
                {
                    PaymentInfo = paymentInfo
                };

                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'FullInvoiceDetailsById' invocation.", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("GetPaymentInfoByInvoiceId")]
        public async Task<IActionResult> GetPaymentInfoByInvoiceId([FromQuery] int companyId, [FromQuery] int invoiceNumber)
        {
            try
            {
                var paymentInfo = await _service.GetPaymentInfoByInvoiceId(companyId, invoiceNumber);
                if (paymentInfo == null)
                {
                    return StatusCode(500, "Error retrieving Invoice Info.");
                }

                return Ok(paymentInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'FullInvoiceDetailsById' invocation.", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("IsElectronicInvoiceProcessed")]
        public async Task<IActionResult> IsElectronicInvoiceProcessed([FromQuery] int companyId, [FromQuery] int invoiceNumber)
        {
            try
            {
                var paymentInfo = await _service.IsElectronicInvoiceProcessed(companyId, invoiceNumber);
                if (paymentInfo == null)
                {
                    return StatusCode(500, "Error retrieving Invoice Info.");
                }

                return Ok(paymentInfo);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'FullInvoiceDetailsById' invocation.", ex.Message);
                return StatusCode(500, ex.Message);
            }
        }


        [HttpGet("PrepareInvoice")]
        public async Task<IActionResult> PrepareInvoice([FromQuery] int invoiceId, [FromQuery] bool downloadPDF)
        {
            try
            {
                string invoiceHtml = "";
                var invoiceDetails = await GetFullInvoiceDetailsById(invoiceId);

                if (invoiceDetails is ObjectResult objectResult && objectResult.StatusCode == 200)
                {
                    var invoiceData = objectResult.Value as dynamic;

                    if (invoiceData?.InvoiceDetails != null && invoiceData.InvoiceDetails.Count > 0)
                    {
                        invoiceHtml = await _generateService.PrepareInvoiceHtmlAsync(invoiceData);

                        if (downloadPDF)
                        {
                            var pdfResult = await _generateService.GeneratePdfFromHtmlAsync(invoiceHtml);
                            return pdfResult;
                        }
                    }
                }

                return Content(invoiceHtml);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "There was an error on 'PrepareInvoice' invocation.");
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpGet("GetPaymentDetails")]
        public async Task<IActionResult> GetPaymentDetails([FromQuery] int companyId, [FromQuery] int paymentId)
        {
            try
            {
                if (companyId <= 0 || paymentId <= 0)
                {
                    return BadRequest("Invalid companyId or paymentId.");
                }
                var result = await _service.GetPaymentDetails(companyId, paymentId);

                if (result == null)
                {
                    return NotFound("Payment details not found.");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching payment details.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpGet("GetPaymentDetailsForLabel")]
        public async Task<IActionResult> GetPaymentDetailsForLabel([FromQuery] int companyId, [FromQuery] int paymentId)
        {
            try
            {
                if (companyId <= 0 || paymentId <= 0)
                {
                    return BadRequest("Invalid companyId or paymentId.");
                }
                var result = await _service.GetPaymentDetailsForLable(companyId, paymentId);

                if (result == null)
                {
                    return NotFound("Payment details not found.");
                }
                return Ok(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching payment details.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }

        [HttpPost("ValidateAndApplyAccountEntry")]
        public async Task<IActionResult> ValidateAndApplyAccountEntry([FromQuery] int companyId, [FromQuery] string entryCode)
        {
            try
            {

                var result = await _service.ValidateAccountingEntry(companyId, entryCode);
                if (result.Success && result.Data == 1)
                {
                    var applyResult = await _service.ApplyAccountingEntry(companyId, entryCode);
                    if (applyResult.Success)
                    {
                        return Ok(result);
                    }
                    else
                    {
                        return Ok(result);
                    }
                }
                else
                {
                    result.Message = "Invalid accounting entry.";
                    return Ok(result);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching payment details.");
                return StatusCode(StatusCodes.Status500InternalServerError, "An error occurred while processing your request.");
            }
        }
        [HttpGet("GetExcel_PendingInvoicesReport")]
        public async Task<IActionResult> GetExcel_PendingInvoicesReport([FromQuery] int companyId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int paymentType, [FromQuery] int zoneId)
        {
            try
            {

                var response = await _service.GetPendingInvoicesReportAsync(companyId, startDate, endDate, paymentType, zoneId);

                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Pending Invoices");

                    worksheet.Columns().Width = 20;

                    var titleRange = worksheet.Range("A1:C3");
                    titleRange.Merge();
                    titleRange.Value = "Pending Invoices Report";
                    titleRange.Style.Font.Bold = true;
                    titleRange.Style.Font.FontSize = 14;
                    titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    titleRange.Style.Alignment.WrapText = true;

                    var generatedDateRange = worksheet.Range("J1:L3");
                    generatedDateRange.Merge();
                    generatedDateRange.Value = "Generated on: " + DateTime.Now.ToString("MM/dd/yyyy hh:mm:ss tt");
                    generatedDateRange.Style.Font.Bold = false;
                    generatedDateRange.Style.Font.FontSize = 12;
                    generatedDateRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    generatedDateRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    generatedDateRange.Style.Alignment.WrapText = true;


                    var headerRange = worksheet.Range("A4:L4");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Font.FontName = "Tahoma";
                    headerRange.Style.Font.FontSize = 10;
                    headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#4C68A2");
                    headerRange.Style.Font.FontColor = XLColor.White;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    string[] headers = {
                "CUSTOMER CODE", "CUSTOMER NAME", "PAYMENT TYPE", "ZONE", "INVOICE",
                "INVOICE DATE", "STATUS", "TOTAL USD", "TOTAL LOCAL", "BALANCE USD", "BALANCE LOCAL", "STOP"
            };

                    int row = 4;
                    for (int i = 0; i < headers.Length; i++)
                    {
                        worksheet.Cell(row, i + 1).Value = headers[i];
                    }

                    if (response.Success && response.Data != null && response.Data.Count > 0)
                    {
                        row++;
                        var reportData = response.Data.ToList();

                        foreach (var item in reportData)
                        {
                            worksheet.Cell(row, 1).Value = item.CustomerCode;
                            worksheet.Cell(row, 2).Value = item.CustomerFullName;
                            worksheet.Cell(row, 3).Value = item.PaymentType;
                            worksheet.Cell(row, 4).Value = item.Zone;
                            worksheet.Cell(row, 5).Value = item.InvoiceNumber;
                            worksheet.Cell(row, 6).Value = item.InvoiceDate.ToString("yyyy-MM-dd");
                            worksheet.Cell(row, 7).Value = item.InvoiceStatus;
                            worksheet.Cell(row, 8).Value = item.FormattedTotal;
                            worksheet.Cell(row, 9).Value = item.FormattedTotalLocal;
                            worksheet.Cell(row, 10).Value = item.FormattedBalance;
                            worksheet.Cell(row, 11).Value = item.FormattedLocalBalance;
                            worksheet.Cell(row, 12).Value = item.Stop;
                            row++;
                        }

                        worksheet.Range("A1:L" + row).Style.Alignment.WrapText = true;
                        worksheet.Range("A1:L" + row).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                        worksheet.Range("A1:L" + row).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    }

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Pending_Invoices_Report.xlsx");
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error and return server error status
                _logger.LogError("Error in 'GetExcel_PendingInvoicesReport': ", ex.Message);
                return StatusCode(500, "An error occurred while generating the report.");
            }
        }


        [HttpGet("GetExcel_SalesReport")]
        public async Task<IActionResult> GetExcel_SalesReport([FromQuery] int companyId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] string customerCode = "")
        {
            try
            {

                var response = await _service.GetSalesReportAsync(companyId, startDate, endDate, customerCode);


                if (response == null || response.Data == null || !response.Data.Any())
                {
                    // Generate a report with the headers and a 'No Data Available' message
                    using (var workbook = new XLWorkbook())
                    {
                        var worksheet = workbook.Worksheets.Add("Sales Report");

                        worksheet.Columns().Width = 20;

                        // Add "Consulta del" date range header (Row 1)
                        var dateRangeHeaderRange = worksheet.Range("D1:O3");
                        dateRangeHeaderRange.Merge();
                        dateRangeHeaderRange.Value = $" Sales Report \n Consultation from {startDate:dd/MM/yyyy} to {endDate:dd/MM/yyyy}";
                        dateRangeHeaderRange.Style.Font.Bold = true;
                        dateRangeHeaderRange.Style.Font.FontSize = 12;
                        dateRangeHeaderRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                        dateRangeHeaderRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                        // Merge cells for title and generated date (Row 2-3)
                        var titleRange = worksheet.Range("A1:C3");
                        titleRange.Merge();
                        titleRange.Value = "";
                        titleRange.Style.Font.Bold = true;
                        titleRange.Style.Font.FontSize = 14;
                        titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                        titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                        titleRange.Style.Alignment.WrapText = true;

                        // Adding "Generated on: {date}" (Row 2-3)
                        var generatedDateRange = worksheet.Range("P1:R3");
                        generatedDateRange.Merge();
                        generatedDateRange.Value = "Generated on: " + DateTime.Now.ToString("MM/dd/yyyy hh:mm:ss tt");
                        generatedDateRange.Style.Font.Italic = true;
                        generatedDateRange.Style.Font.FontSize = 10;
                        generatedDateRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                        generatedDateRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                        generatedDateRange.Style.Alignment.WrapText = true;

                        // Formatting header row (Row 5)
                        var headerRange = worksheet.Range("A4:R4");
                        headerRange.Style.Font.Bold = true;
                        headerRange.Style.Font.FontName = "Tahoma";
                        headerRange.Style.Font.FontSize = 10;
                        headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#4C68A2");
                        headerRange.Style.Font.FontColor = XLColor.White;
                        headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                        headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                        string[] headers = {
                    "INVOICE NUMBER", "ISSUE DATE", "INVOICE TYPE", "CUSTOMER NAME", "DETAIL LINE DESCRIPTION",
                    "DETAIL LINE QUANTITY", "CURRENCY CODE", "UNIT PRICE", "DISCOUNT AMOUNT", "TAX RATE",
                    "TAX AMOUNT", "TOTAL LINE AMOUNT", "CURRENCY EXCHANGE RATE", "RESPONSE", "PAYMENT METHOD",
                    "SALE CONDITION", "OTHER CHARGES DESCRIPTION", "OTHER CHARGES AMOUNT"
                };

                        for (int i = 0; i < headers.Length; i++)
                        {
                            worksheet.Cell(4, i + 1).Value = headers[i];
                        }

                        // Add a row indicating "No data available"
                        worksheet.Cell(6, 1).Value = "No data available for the report.";
                        worksheet.Range("A6:R6").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                        worksheet.Range("A1:R6").Style.Alignment.WrapText = true;
                        worksheet.Range("A1:R6").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                        worksheet.Range("A1:R6").Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                        using (var stream = new MemoryStream())
                        {
                            workbook.SaveAs(stream);
                            var content = stream.ToArray();
                            return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Sales_Report.xlsx");
                        }
                    }
                }

                // Process and generate the report with actual data if available
                var reportData = response.Data.ToList();

                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Sales Report");

                    worksheet.Columns().Width = 20;

                    // Add "Consulta del" date range header (Row 1)
                    var dateRangeHeaderRange = worksheet.Range("D1:O3");
                    dateRangeHeaderRange.Merge();
                    dateRangeHeaderRange.Value = $"Sales Report \n Consultation from  {startDate:dd/MM/yyyy} to {endDate:dd/MM/yyyy}";
                    dateRangeHeaderRange.Style.Font.Bold = true;
                    dateRangeHeaderRange.Style.Font.FontSize = 12;
                    dateRangeHeaderRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    dateRangeHeaderRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    // Merge cells for title and generated date (Row 2-3)
                    var titleRange = worksheet.Range("A1:C3");
                    titleRange.Merge();
                    titleRange.Value = "";
                    titleRange.Style.Font.Bold = true;
                    titleRange.Style.Font.FontSize = 14;
                    titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    titleRange.Style.Alignment.WrapText = true;

                    // Adding "Generated on: {date}" (Row 2-3)
                    var generatedDateRange = worksheet.Range("P1:Q3");
                    generatedDateRange.Merge();
                    generatedDateRange.Value = "Generated on: " + DateTime.Now.ToString("MM/dd/yyyy hh:mm:ss tt");
                    generatedDateRange.Style.Font.Italic = true;
                    generatedDateRange.Style.Font.FontSize = 10;
                    generatedDateRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    generatedDateRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    generatedDateRange.Style.Alignment.WrapText = true;

                    // Formatting header row (Row 5)
                    var headerRange = worksheet.Range("A4:R4");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Font.FontName = "Tahoma";
                    headerRange.Style.Font.FontSize = 10;
                    headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#4C68A2");
                    headerRange.Style.Font.FontColor = XLColor.White;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    string[] headers = {
                "INVOICE NUMBER", "ISSUE DATE", "INVOICE TYPE", "CUSTOMER NAME", "DETAIL LINE DESCRIPTION",
                "DETAIL LINE QUANTITY", "CURRENCY CODE", "UNIT PRICE", "DISCOUNT AMOUNT", "TAX RATE",
                "TAX AMOUNT", "TOTAL LINE AMOUNT", "CURRENCY EXCHANGE RATE", "RESPONSE", "PAYMENT METHOD",
                "SALE CONDITION", "OTHER CHARGES DESCRIPTION", "OTHER CHARGES AMOUNT"
            };

                    for (int i = 0; i < headers.Length; i++)
                    {
                        worksheet.Cell(4, i + 1).Value = headers[i];
                    }

                    // Add data rows
                    int row = 5;
                    foreach (var item in reportData)
                    {
                        worksheet.Cell(row, 1).Value = item.InvoiceNumber;
                        worksheet.Cell(row, 2).Value = item.IssueDate.ToString("yyyy-MM-dd");
                        worksheet.Cell(row, 3).Value = item.InvoiceType;
                        worksheet.Cell(row, 4).Value = item.CustomerName;
                        worksheet.Cell(row, 5).Value = item.DetailLineDescription;
                        worksheet.Cell(row, 6).Value = item.DetailLineQuantity;
                        worksheet.Cell(row, 7).Value = item.CurrencyCode;
                        worksheet.Cell(row, 8).Value = item.UnitPrice;
                        worksheet.Cell(row, 9).Value = item.DiscountAmount;
                        worksheet.Cell(row, 10).Value = item.TaxRate;
                        worksheet.Cell(row, 11).Value = item.TaxAmount;
                        worksheet.Cell(row, 12).Value = item.TotalLineAmount;
                        worksheet.Cell(row, 13).Value = item.CurrencyExchangeRate;
                        worksheet.Cell(row, 14).Value = item.Response;
                        worksheet.Cell(row, 15).Value = item.PaymentMethod;
                        worksheet.Cell(row, 16).Value = item.SaleCondition;
                        worksheet.Cell(row, 17).Value = item.OtherChargesDescription;
                        worksheet.Cell(row, 18).Value = item.OtherChargesAmount;

                        row++;
                    }

                    worksheet.Range("A1:R" + row).Style.Alignment.WrapText = true;
                    worksheet.Range("A1:R" + row).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    worksheet.Range("A1:R" + row).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Sales_Report.xlsx");
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error and return server error status
                _logger.LogError("Error in 'export-sales-report': ", ex.Message);
                return StatusCode(500, "An error occurred while generating the report.");
            }
        }



        [HttpPost("InsertCustomsTaxLoad")]
        public async Task<IActionResult> InsertCustomsTaxLoad([FromBody] List<CustomsTaxLoad> taxLoadList)
        {


            var response = await _service.InsertCustomsTaxLoadAsync(taxLoadList);


            return Ok(new { response.Success, response.Message });


        }



        [HttpGet("GetPackage")]
        public async Task<IActionResult> GetCustomsTaxByPackageNumber(string packageNumber)
        {
            var response = await _service.GetCustomsTaxByPackageNumberAsync(packageNumber);

            return Ok(response);
        }



        [HttpGet("GetBag")]
        public async Task<IActionResult> GetCustomsTaxByBag(string bag)
        {
            var response = await _service.GetCustomsTaxByBagAsync(bag);

            return Ok(response);
        }



        [HttpGet("GetExcel_AeropostMassUploadReport")]
        public async Task<IActionResult> GetExcel_AeropostMassUploadReport([FromQuery] int companyId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int providerId)
        {

            var response = await _service.GetAeropostMassUploadReportAsync(companyId, startDate, endDate, providerId);

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Aeropost Upload Report");

                worksheet.Columns().Width = 20;

                var titleRange1 = worksheet.Range("A1:K3");
                titleRange1.Merge();
                titleRange1.Style.Font.Bold = true;
                titleRange1.Style.Font.FontSize = 14;
                titleRange1.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                titleRange1.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                var titleRange = worksheet.Range("A1:F3");
                titleRange.Merge();
                titleRange.Value = "Aeropost Mass Upload Report";
                titleRange.Style.Font.Bold = true;
                titleRange.Style.Font.FontSize = 14;
                titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                var dateRange = worksheet.Range("G1:K3");
                dateRange.Merge();
                dateRange.Value = "Generated on: " + DateTime.Now.ToString("MM/dd/yyyy hh:mm:ss tt");
                dateRange.Style.Font.FontSize = 12;
                dateRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                dateRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                // Headers
                var headers = new string[]
                {
                "INVOICE", "PROVIDER", "GL DETAIL", "REPORT DATE", "CURRENCY",
                "SUBTOTAL", "VAT", "EXEMPT", "TAXABLE", "PARAFISCAL", "TOTAL"
                };

                int row = 4;
                for (int i = 0; i < headers.Length; i++)
                {
                    worksheet.Cell(row, i + 1).Value = headers[i];
                    worksheet.Cell(row, i + 1).Style.Font.Bold = true;
                    worksheet.Cell(row, i + 1).Style.Fill.BackgroundColor = XLColor.FromHtml("#4C68A2");
                    worksheet.Cell(row, i + 1).Style.Font.FontColor = XLColor.White;
                    worksheet.Cell(row, i + 1).Style.Font.FontName = "Tahoma";
                    worksheet.Cell(row, i + 1).Style.Font.FontSize = 10;
                    worksheet.Cell(row, i + 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                }

                // Data Rows
                if (response.Success && response.Data != null)
                {
                    row++;
                    foreach (var item in response.Data)
                    {
                        worksheet.Cell(row, 1).Value = item.Invoice;
                        worksheet.Cell(row, 2).Value = item.ProviderName;
                        worksheet.Cell(row, 3).Value = item.GLDetail;
                        worksheet.Cell(row, 4).Value = item.ReportDate.ToString("yyyy-MM-dd");
                        worksheet.Cell(row, 5).Value = item.Currency;
                        worksheet.Cell(row, 6).Value = item.Subtotal;
                        worksheet.Cell(row, 7).Value = item.VAT;
                        worksheet.Cell(row, 8).Value = item.Exempt;
                        worksheet.Cell(row, 9).Value = item.Taxable;
                        worksheet.Cell(row, 10).Value = item.Parafiscal;
                        worksheet.Cell(row, 11).Value = item.Total;


                        for (int col = 1; col <= 11; col++)
                        {
                            worksheet.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                            worksheet.Cell(row, col).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                        }

                        row++;
                    }
                }

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Aeropost_Mass_Upload_Report.xlsx");
                }
            }

        }

        [AllowAnonymous]
        [HttpGet("GetExcel_CustomsTaxesReport")]
        public async Task<IActionResult> GetExcel_CustomsTaxesReport(
     [FromQuery] string customerCode,
     [FromQuery] DateTime startDate,
     [FromQuery] DateTime endDate,
     [FromQuery] string? manifestNumber = "",
     [FromQuery] string? bag = "")
        {
            var response = await _service.GetCustomsTaxesReportAsync(customerCode, startDate, endDate, manifestNumber, bag);

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Customs Taxes Report");
            worksheet.Columns().Width = 20;

            // Title
            var titleRange = worksheet.Range("A1:J2");
            titleRange.Merge();
            titleRange.Value = "Customs Taxes Report";
            titleRange.Style.Font.Bold = true;
            titleRange.Style.Font.FontSize = 14;
            titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

            // Headers
            var headers = new string[]
            {
        "Package", "Customer Name", "Origin", "Weight (KG)", "Description",
        "FOB", "CIF", "DUA", "Amount", "AWB"
            };

            int row = 3;
            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cell(row, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Font.FontName = "Tahoma";
                cell.Style.Font.FontSize = 10;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#4C68A2");
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            }

            // Data Rows
            if (response.Success && response.Data != null)
            {
                row++;
                foreach (var item in response.Data)
                {
                    worksheet.Cell(row, 1).Value = item.Package;
                    worksheet.Cell(row, 2).Value = item.CustomerName;
                    worksheet.Cell(row, 3).Value = item.Origin;
                    worksheet.Cell(row, 4).Value = item.WeightKG;
                    worksheet.Cell(row, 5).Value = item.PackageDescription;
                    worksheet.Cell(row, 6).Value = item.FOB;
                    worksheet.Cell(row, 7).Value = item.CIF;
                    worksheet.Cell(row, 8).Value = item.DUA;
                    worksheet.Cell(row, 9).Value = item.Amount;
                    worksheet.Cell(row, 10).Value = item.AWB;

                    for (int col = 1; col <= 10; col++)
                    {
                        worksheet.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                        worksheet.Cell(row, col).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    }

                    worksheet.Cell(row, 4).Style.NumberFormat.Format = "#,##0.00";      // Weight
                    worksheet.Cell(row, 6).Style.NumberFormat.Format = "$#,##0.00";     // FOB
                    worksheet.Cell(row, 7).Style.NumberFormat.Format = "$#,##0.00";     // CIF
                    worksheet.Cell(row, 9).Style.NumberFormat.Format = "$#,##0.00";     // Amount

                    row++;
                }

                decimal totalFOB = response.Data.Sum(x => x.FOB ?? 0);
                decimal totalCIF = response.Data.Sum(x => x.CIF ?? 0);
                decimal totalAmount = response.Data.Sum(x => x.Amount ?? 0);


                worksheet.Cell(row, 5).Value = "Total:";
                worksheet.Cell(row, 5).Style.Font.Bold = true;
                worksheet.Cell(row, 5).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;

                worksheet.Cell(row, 6).Value = totalFOB;
                worksheet.Cell(row, 6).Style.NumberFormat.Format = "$#,##0.00";
                worksheet.Cell(row, 6).Style.Font.Bold = true;
                worksheet.Cell(row, 6).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                worksheet.Cell(row, 6).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                worksheet.Cell(row, 7).Value = totalCIF;
                worksheet.Cell(row, 7).Style.NumberFormat.Format = "$#,##0.00";
                worksheet.Cell(row, 7).Style.Font.Bold = true;
                worksheet.Cell(row, 7).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                worksheet.Cell(row, 7).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                worksheet.Cell(row, 9).Value = totalAmount;
                worksheet.Cell(row, 9).Style.NumberFormat.Format = "$#,##0.00";
                worksheet.Cell(row, 9).Style.Font.Bold = true;
                worksheet.Cell(row, 9).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                worksheet.Cell(row, 9).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;


                // Optional: Highlight total row
                var totalRange = worksheet.Range(row, 5, row, 9);
                totalRange.Style.Fill.BackgroundColor = XLColor.LightGray;
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();

            return File(content,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "Customs_Taxes_Report.xlsx");
        }




    }
}
