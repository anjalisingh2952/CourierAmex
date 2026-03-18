using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Storage.Domain;
using ClosedXML.Excel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using Microsoft.AspNetCore.Http;
using System.Globalization;
using DocumentFormat.OpenXml.Spreadsheet;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class CompanyInvoiceController : ControllerBase
    {
        private readonly ILogger<CompanyInvoiceController> _logger;
        private readonly ICompanyInvoiceService _service;

        public CompanyInvoiceController(ILogger<CompanyInvoiceController> logger, ICompanyInvoiceService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet("GetManifest")]
        public async Task<IActionResult> GetManifest([FromQuery] int companyid)
        {
            GenericResponse<List<ManifestModel>> response;
            try
            {
                response = await _service.GetManifestAsync(companyid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetManifest' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetInvoiceDataByCustomer")]
        public async Task<IActionResult> GetInvoiceDataByCustomer([FromQuery] string clientid, [FromQuery] string packagenumber = "")
        {
            GenericResponse<CompanyInvoiceData> response;
            try
            {
                response = await _service.GetInvoiceDataByCustomerAsync(clientid, packagenumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetInvoiceDataByCustomer' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetInvoiceDataByManifest")]
        public async Task<IActionResult> GetInvoiceDataByManifest([FromQuery] int manifestid, [FromQuery] string packagenumber = "")
        {
            GenericResponse<CompanyInvoiceData> response;
            try
            {
                response = await _service.GetInvoiceDataByManifestAsync(manifestid, packagenumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetInvoiceDataByManifest' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("VerifyPackageNumberAndManifestIdAsync")]
        public async Task<IActionResult> VerifyPackageNumberAndManifestId([FromQuery] int manifestid, [FromQuery] string packagenumber = "")
        {
            GenericResponse<int> response;
            try
            {
                response = await _service.VerifyPackageNumberAndManifestIdAsync(manifestid, packagenumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'VerifyPackageNumberAndManifestIdAsync' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("CreateInvoiceHeader")]
        public async Task<IActionResult> CreateInvoiceHeader([FromBody] ComapnyInvoiceHeader entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<int?> response;
            try
            {
                response = await _service.CreateInvoiceHeaderAsync(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'CreateInvoiceHeader' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("CreateInvoiceDetail")]
        public async Task<IActionResult> CreateInvoiceDetail([FromBody] CompanyInvoiceDetail entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<int?> response;
            try
            {
                response = await _service.CreateInvoiceDetailAsync(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'CreateInvoiceDetail' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetNewInvoiceNumber")]
        public async Task<IActionResult> GetNewInvoiceNumber()
        {
            GenericResponse<int?> response;
            try
            {
                response = await _service.GetNewInvoiceNumberAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetNewInvoiceNumber' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetInvoiceArticlesJamaica")]
        public async Task<IActionResult> GetInvoiceArticlesJamaica([FromQuery] string zone, [FromQuery] float weight, [FromQuery] float value, [FromQuery] float volume, [FromQuery] int shippingType, [FromQuery] int package)
        {
            GenericResponse<List<InvoiceArticle>> response;
            try
            {
                response = await _service.GetInvoiceArticlesJamaicaAsync(zone, weight, value, volume, shippingType, package);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetInvoiceArticlesJamaica' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetInvoiceArticles")]
        public async Task<IActionResult> GetInvoiceArticles([FromQuery] string customer, [FromQuery] int type, [FromQuery] float weight, [FromQuery] float volume, [FromQuery] int shippingType, [FromQuery] string packages)
        {
            GenericResponse<List<InvoiceArticle>> response;
            try
            {
                response = await _service.GetInvoiceArticlesAsync(customer, type, weight, volume, shippingType, packages);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetInvoiceArticles' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("UpdateInvoiceStatus")]
        public async Task<IActionResult> UpdateInvoiceStatus([FromBody] UpdateInvoiceStatusRequest request)
        {
            GenericResponse<int?> response;
            try
            {
                response = await _service.UpdateInvoiceStatus(request.Packages);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetNewInvoiceNumber' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Get_OutstandingCreditCustomerInvoices")]
        public async Task<IActionResult> Get_OutstandingCreditCustomerInvoices([FromQuery] int companyid, [FromQuery] string startDate, [FromQuery] string endDate, [FromQuery] string zoneIds)
        {
            GenericResponse<List<InvoiceCreditPending>> response;
            try
            {
                string dateFormat = "MM-dd-yyyy";

                // Parse the date using DateTime.ParseExact
                DateTime _startdate = DateTime.ParseExact(startDate, dateFormat, CultureInfo.InvariantCulture);
                DateTime _enddate = DateTime.ParseExact(endDate, dateFormat, CultureInfo.InvariantCulture);
                response = await _service.Get_OutstandingCreditCustomerInvoicesAsync(companyid, _startdate, _enddate, zoneIds);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Get_OutstandingCreditCustomerInvoices' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetExcel_OutstandingCreditCustomerInvoices")]
        public async Task<IActionResult> GetExcel_OutstandingCreditCustomerInvoices([FromQuery] int companyid, [FromQuery] string startDate, [FromQuery] string endDate, [FromQuery] string zoneIds)
        {
            GenericResponse<List<InvoiceCreditPending>>? response;
            try
            {
                string dateFormat = "MM-dd-yyyy";

                // Parse the date using DateTime.ParseExact
                DateTime _startdate = DateTime.ParseExact(startDate, dateFormat, CultureInfo.InvariantCulture);
                DateTime _enddate = DateTime.ParseExact(endDate, dateFormat, CultureInfo.InvariantCulture);
                response = await _service.Get_OutstandingCreditCustomerInvoicesAsync(companyid, _startdate, _enddate, zoneIds);

                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Invoice Credit Pending");

                    // Apply column widths
                    worksheet.Column("A").Width = 12;
                    worksheet.Column("B").Width = 15;
                    worksheet.Column("C").Width = 13;
                    worksheet.Column("D").Width = 12;
                    worksheet.Column("E").Width = 17;
                    worksheet.Column("F").Width = 20;
                    worksheet.Column("G").Width = 13;
                    worksheet.Column("H").Width = 20;
                    worksheet.Column("I").Width = 13;
                    worksheet.Column("J").Width = 13;
                    worksheet.Column("K").Width = 13;
                    worksheet.Column("L").Width = 13;

                    // Merge A1:D3 for Image Placement
                    var imageCellRange = worksheet.Range("A1:D3");
                    imageCellRange.Merge();
                    // Load and Insert Image
                    var imagePath = "";// Path.Combine(Directory.GetCurrentDirectory(), "Templates", "AmericanExportLogo.png");
                    //var picture = worksheet.AddPicture(imagePath)
                    //    .MoveTo(worksheet.Cell("A1"));

                    // Calculate Width (Sum of Merged Columns' Widths)
                    double totalWidth = worksheet.Column(1).Width +
                                        worksheet.Column(2).Width +
                                        worksheet.Column(3).Width +
                                        worksheet.Column(4).Width;

                    // Calculate Height (Sum of Merged Rows' Heights)
                    double totalHeight = worksheet.Row(1).Height +
                                         worksheet.Row(2).Height +
                                         worksheet.Row(3).Height;

                    // Resize Image to Fit the Merged Range
                    //picture.WithSize((int)(totalWidth * 7), (int)(totalHeight * 1.5));

                    // Align Image
                    imageCellRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    imageCellRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    // Merge Cells for Title
                    var titleRange = worksheet.Range("E1:H2");
                    titleRange.Merge();
                    titleRange.Value = "Customers with Authorized Credit\nPending Credit";
                    titleRange.Style.Font.Bold = true;
                    titleRange.Style.Font.FontSize = 14;
                    titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    titleRange.Style.Alignment.WrapText = true;

                    // Merge Cells for Title
                    var daterange = worksheet.Range("I1:K2");
                    daterange.Merge();
                    daterange.Value = "Invoice Generated:" + DateTime.Now.ToString("MM/dd/yyyy hh:mm:ss tt");
                    daterange.Style.Font.FontSize = 10;
                    daterange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    daterange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    daterange.Style.Alignment.WrapText = true;

                    // Formatting Header Row (Row 5)
                    var headerRange = worksheet.Range("A5:K5");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Font.FontName = "Tahoma";
                    headerRange.Style.Font.FontSize = 11;
                    headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#4C68A2");
                    headerRange.Style.Font.FontColor = XLColor.White;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;

                    // Set Row 5 Height to Double
                    worksheet.Row(5).Height = worksheet.Row(5).Height * 2;

                    // Add Headers
                    string[] headers = { "Customer", "Payment Type", "Zone", "# Invoice", "Invoice Date", "Invoice Status", "Total $", "Total Local", "Balance $", "Balance Local", "Location" };
                    for (int i = 0; i < headers.Length; i++)
                    {
                        worksheet.Cell(5, i + 1).Value = headers[i];
                    }

                    // Append Data with Merging Customer and Apply Font Colors
                    int row = 6;
                    int startMergeRow = row;
                    string previousCustomer = null;


                    // Variables to hold totals
                    double customerTotalAmount = 0;
                    double customerTotalLocalAmount = 0;
                    double customerTotalBalance = 0;
                    double customerTotalLocalBalance = 0;

                    foreach (var record in response.Data)
                    {
                        string customerInfo = record.CustomerCode + "\n" + record.FullName;

                        if (previousCustomer != null && previousCustomer != customerInfo)
                        {
                            // Merge Customer column for previous group
                            worksheet.Range($"A{startMergeRow}:A{row - 1}").Merge();
                            worksheet.Range($"A{startMergeRow}:A{row - 1}").Style.Fill.BackgroundColor = XLColor.FromArgb(149, 179, 215);
                            worksheet.Range($"A{startMergeRow}:A{row - 1}").Style.Font.Bold = true;

                            // Add empty row with header background color up to column K
                            worksheet.Range($"A{row}:K{row}").Style.Fill.BackgroundColor = XLColor.FromArgb(149, 179, 215);

                            // Merge A column of the empty row with the previous customer
                            worksheet.Range($"A{startMergeRow}:A{row}").Merge();

                            // Set totals in G, H, I, and J columns of empty row
                            worksheet.Cell(row, 7).Value = customerTotalAmount.ToString("F2");
                            worksheet.Cell(row, 8).Value = customerTotalLocalAmount.ToString("F2");
                            worksheet.Cell(row, 9).Value = customerTotalBalance.ToString("F2");
                            worksheet.Cell(row, 10).Value = customerTotalLocalBalance.ToString("F2");

                            // Apply formatting to total values
                            for (int col = 7; col <= 10; col++)
                            {
                                worksheet.Cell(row, col).Style.Font.Bold = true;
                                worksheet.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                                worksheet.Cell(row, col).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
                            }

                            row++; // Move to next row
                            startMergeRow = row;

                            // Reset totals for new customer
                            customerTotalAmount = 0;
                            customerTotalLocalAmount = 0;
                            customerTotalBalance = 0;
                            customerTotalLocalBalance = 0;
                        }

                        // Convert values to double
                        double totalAmount = Convert.ToDouble(record.TotalAmount);
                        double totalLocalAmount = Convert.ToDouble(record.TotalLocalAmount);
                        double balance = Convert.ToDouble(record.Balance);
                        double localBalance = Convert.ToDouble(record.LocalBalance);

                        worksheet.Cell(row, 1).Value = customerInfo;
                        worksheet.Cell(row, 2).Value = record.PaymentType;
                        worksheet.Cell(row, 3).Value = record.Zone;
                        worksheet.Cell(row, 4).Value = record.InvoiceNumber;
                        worksheet.Cell(row, 5).Value = record.InvoiceDate.ToString("yyyy-MM-dd");
                        worksheet.Cell(row, 6).Value = record.InvoiceStatus;
                        worksheet.Cell(row, 7).Value = totalAmount.ToString("F2");
                        worksheet.Cell(row, 8).Value = totalLocalAmount.ToString("F2");
                        worksheet.Cell(row, 9).Value = balance.ToString("F2");
                        worksheet.Cell(row, 10).Value = localBalance.ToString("F2");
                        worksheet.Cell(row, 11).Value = record.Stop;

                        // Add values to customer totals
                        customerTotalAmount += totalAmount;
                        customerTotalLocalAmount += totalLocalAmount;
                        customerTotalBalance += balance;
                        customerTotalLocalBalance += localBalance;

                        // Apply font styles
                        worksheet.Row(row).Style.Font.FontName = "Tahoma";
                        worksheet.Row(row).Style.Font.FontSize = 10;
                        worksheet.Row(row).Style.Font.FontColor = XLColor.Black;
                        worksheet.Range($"A{row}:K{row}").Style.Alignment.WrapText = true;

                        // Set Text Alignment:

                        // Column A (Customer) → Top, Left
                        worksheet.Cell(row, 1).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                        worksheet.Cell(row, 1).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;

                        // Columns G, H, I, J (Amounts & Balances) → Top, Right
                        worksheet.Cell(row, 7).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                        worksheet.Cell(row, 8).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                        worksheet.Cell(row, 9).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                        worksheet.Cell(row, 10).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                        worksheet.Cell(row, 7).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
                        worksheet.Cell(row, 8).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
                        worksheet.Cell(row, 9).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
                        worksheet.Cell(row, 10).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;

                        // Other Columns (B, C, D, E, F, K, L) → Top, Centered
                        for (int col = 2; col <= 6; col++)
                        {
                            worksheet.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                            worksheet.Cell(row, col).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
                        }
                        for (int col = 11; col <= 12; col++)
                        {
                            worksheet.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                            worksheet.Cell(row, col).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
                        }

                        previousCustomer = customerInfo;
                        row++;
                    }

                    // Ensure last customer gets an empty row with total
                    if (startMergeRow < row - 1)
                    {
                        worksheet.Range($"A{startMergeRow}:A{row - 1}").Merge();
                        worksheet.Range($"A{startMergeRow}:A{row - 1}").Style.Fill.BackgroundColor = XLColor.FromArgb(149, 179, 215);
                        worksheet.Range($"A{startMergeRow}:A{row - 1}").Style.Font.Bold = true;

                        worksheet.Range($"A{row}:K{row}").Style.Fill.BackgroundColor = XLColor.FromArgb(149, 179, 215);
                        worksheet.Range($"A{startMergeRow}:A{row}").Merge();

                        worksheet.Cell(row, 7).Value = customerTotalAmount.ToString("F2");
                        worksheet.Cell(row, 8).Value = customerTotalLocalAmount.ToString("F2");
                        worksheet.Cell(row, 9).Value = customerTotalBalance.ToString("F2");
                        worksheet.Cell(row, 10).Value = customerTotalLocalBalance.ToString("F2");

                        for (int col = 7; col <= 10; col++)
                        {
                            worksheet.Cell(row, col).Style.Font.Bold = true;
                            worksheet.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                            worksheet.Cell(row, col).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
                        }
                    }

                    // Ensure last customer gets an empty row with totals
                    AddEmptyRowWithTotals(worksheet, startMergeRow, row, ref customerTotalAmount, ref customerTotalLocalAmount, ref customerTotalBalance, ref customerTotalLocalBalance);

                    // Enable text wrapping for all rows from row 5 onwards
                    worksheet.Range("A5:K" + row).Style.Alignment.WrapText = true;

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "PackageItems.xlsx");
                    }
                }

            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetExcel_OutstandingCreditCustomerInvoices' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
        }

        void AddEmptyRowWithTotals(IXLWorksheet worksheet, int startMergeRow, int row, ref double totalAmount, ref double totalLocalAmount, ref double totalBalance, ref double totalLocalBalance)
        {
            worksheet.Range($"A{startMergeRow}:A{row - 1}").Merge();
            worksheet.Range($"A{startMergeRow}:A{row - 1}").Style.Fill.BackgroundColor = XLColor.FromArgb(149, 179, 215);
            worksheet.Range($"A{startMergeRow}:A{row - 1}").Style.Font.Bold = true;

            worksheet.Range($"A{row}:K{row}").Style.Fill.BackgroundColor = XLColor.FromArgb(149, 179, 215);
            worksheet.Range($"A{startMergeRow}:A{row}").Merge();

            worksheet.Cell(row, 7).Value = totalAmount.ToString("F2");
            worksheet.Cell(row, 8).Value = totalLocalAmount.ToString("F2");
            worksheet.Cell(row, 9).Value = totalBalance.ToString("F2");
            worksheet.Cell(row, 10).Value = totalLocalBalance.ToString("F2");

            for (int col = 7; col <= 10; col++)
            {
                worksheet.Cell(row, col).Style.Font.Bold = true;
                worksheet.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                worksheet.Cell(row, col).Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
            }
        }

        [HttpGet("GetElectronicInvoiceInformation")]
        public async Task<IActionResult> GetElectronicInvoiceInformation([FromQuery] string customerCode)
        {
            GenericResponse<ElectronicInvoice> response;
            try
            {
                response = await _service.GetElectronicInvoiceInformationAsync(customerCode);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetElectronicInvoiceInformation' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("SaveElectronicInvoiceInformation")]
        public async Task<IActionResult> SaveElectronicInvoiceInformation([FromBody] InsertElectronicInvoice entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<int?> response;
            try
            {
                response = await _service.SaveElectronicInvoiceInformationAsync(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'SaveElectronicInvoiceInformation' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("SaveMiamiInvoice")]
        public async Task<IActionResult> SaveMiamiInvoice([FromBody] InsertMiamiInvoice entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<int?> response;
            try
            {
                response = await _service.SaveMiamiInvoiceAsync(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'SaveMiamiInvoice' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("ManifestInvoice")]
        public async Task<IActionResult> ManifestInvoice([FromBody] ManifestInvoice entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<int?> response;
            try
            {
                response = await _service.ManifestInvoiceAsync(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'ManifestInvoice' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetCompanyExchangeRate")]
        public async Task<IActionResult> GetCompanyExchangeRate([FromQuery] int companyId, [FromQuery] int invoiceNumber)
        {
            GenericResponse<CompanyExchangeRate> response;
            try
            {
                response = await _service.GetCompanyExchangeRateAsync(companyId, invoiceNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetCompanyExchangeRate' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetExcel_SalesSummaryReport")]
        public async Task<IActionResult> GetExcel_SalesSummaryReport([FromQuery] string startDate, [FromQuery] string endDate, [FromQuery] string customerCode)
        {
            GenericResponse<List<SalesSummaryReport>>? response;
            try
            {
                string dateFormat = "MM-dd-yyyy";

                // Parse the date using DateTime.ParseExact
                DateTime _startdate = DateTime.ParseExact(startDate, dateFormat, CultureInfo.InvariantCulture);
                DateTime _enddate = DateTime.ParseExact(endDate, dateFormat, CultureInfo.InvariantCulture);
                response = await _service.GetSalesSummaryAsync(startDate, endDate, customerCode);
                var SalesSummaryData = response.Data;

                // Generate Excel file
                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Sales Report Detail Summary");

                    worksheet.Column("A").Width = 18;
                    worksheet.Column("B").Width = 18;
                    worksheet.Column("C").Width = 18;
                    worksheet.Column("D").Width = 18;
                    worksheet.Column("E").Width = 18;
                    worksheet.Column("F").Width = 18;
                    worksheet.Column("G").Width = 18;
                    worksheet.Column("H").Width = 18;
                    worksheet.Column("I").Width = 18;
                    worksheet.Column("J").Width = 18;
                    worksheet.Column("K").Width = 18;
                    worksheet.Column("L").Width = 18;
                    worksheet.Column("M").Width = 18;
                    worksheet.Column("N").Width = 18;
                    worksheet.Column("O").Width = 18;
                    worksheet.Column("P").Width = 18;
                    worksheet.Column("Q").Width = 18;

                    var emptyRange = worksheet.Range("A1:E3");
                    emptyRange.Merge();

                    // Merge Cells for Title
                    var titleRange = worksheet.Range("F1:L3");
                    titleRange.Merge();
                    titleRange.Value = "Sales Summary\nConsultation from " + _startdate.ToString("dd/MM/yyyy") + " to " + _enddate.ToString("dd/MM/yyyy");
                    titleRange.Style.Font.Bold = true;
                    titleRange.Style.Font.FontSize = 14;
                    titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    titleRange.Style.Alignment.WrapText = true;

                    // Merge Cells for Title
                    var daterange = worksheet.Range("M1:Q3");
                    daterange.Merge();
                    daterange.Value = "Invoice Generated:" + DateTime.Now.ToString("MM/dd/yyyy hh:mm:ss tt");
                    daterange.Style.Font.FontSize = 10;
                    daterange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                    daterange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    daterange.Style.Alignment.WrapText = true;

                    // Formatting Header Row (Row 4)
                    var headerRange = worksheet.Range("A4:Q4");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Font.FontName = "Tahoma";
                    headerRange.Style.Font.FontSize = 10;
                    headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#4C68A2");
                    headerRange.Style.Font.FontColor = XLColor.White;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    // Add Headers
                    string[] headers = {"Consecutive Number",
                                        "Issue Date",
                                        "Invoice Type",
                                        "Recipient Name",
                                        "Currency Code",
                                        "Total Amount",
                                        "Exempt Amount",
                                        "Taxable Amount",
                                        "Tax Amount",
                                        "Exempt Goods Amount",
                                        "Sale Amount",
                                        "Response Status",
                                        "Payment Method",
                                        "Sale Condition",
                                        "Client Code",
                                        "Additional Charges Detail",
                                        "Additional Charges Amount"};

                    for (int i = 0; i < headers.Length; i++)
                    {
                        worksheet.Cell(4, i + 1).Value = headers[i];
                    }

                    // Append Data
                    int row = 5;
                    foreach (var item in SalesSummaryData)
                    {
                        worksheet.Cell(row, 1).Value = item.InvoiceNumber;
                        worksheet.Cell(row, 2).Value = item.IssueDate;
                        worksheet.Cell(row, 3).Value = item.InvoiceType;
                        worksheet.Cell(row, 4).Value = item.RecipientName;
                        worksheet.Cell(row, 5).Value = item.CurrencyCode;
                        worksheet.Cell(row, 6).Value = item.TotalAmount;
                        worksheet.Cell(row, 7).Value = item.TotalExemptAmount;
                        worksheet.Cell(row, 8).Value = item.TotalTaxableAmount;
                        worksheet.Cell(row, 9).Value = item.TotalTaxAmount;
                        worksheet.Cell(row, 10).Value = item.TotalExemptGoodsAmount;
                        worksheet.Cell(row, 11).Value = item.TotalSaleAmount;
                        worksheet.Cell(row, 12).Value = item.ResponseStatus;
                        worksheet.Cell(row, 13).Value = item.PaymentMethod;
                        worksheet.Cell(row, 14).Value = item.SaleCondition;
                        worksheet.Cell(row, 15).Value = item.ClientCode;
                        worksheet.Cell(row, 16).Value = item.AdditionalChargesDetail;
                        worksheet.Cell(row, 17).Value = item.AdditionalChargesAmount;

                        row++;
                    }

                    // Enable text wrapping for all rows from row 5 onwards
                    worksheet.Range("A1:Q" + row).Style.Alignment.WrapText = true;
                    worksheet.Range("A1:Q" + row).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    worksheet.Range("A1:Q" + row).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    // Save the workbook to a memory stream
                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Courier_Deconsolidation_Report.xlsx");
                    }
                }

            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetExcel_OutstandingCreditCustomerInvoices' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
        }
    }


}
