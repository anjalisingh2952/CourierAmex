using ClosedXML.Excel;
using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System.Globalization;
using System.Text;


namespace CourierAmex.Controllers.v1
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class InventoryController : Controller
    {
        private readonly ILogger<InventoryController> _logger;
        private readonly IInventoryService _service;

        public InventoryController(ILogger<InventoryController> logger, IInventoryService service)
        {
            _logger = logger;
            _service = service;
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
        [HttpGet("store-inventory")]
        public async Task<IActionResult> GetStoreInventory([FromQuery] int companyId, [FromQuery] int storeId)
        {
            try
            {

                var response = await _service.GetStoreInventoryPackagesAsync(companyId, storeId);


                if (response.Success)
                {
                    return Ok(new { success = true, data = response.Data });
                }
                else
                {
                    return NotFound(new { success = false, message = response.Message });
                }
            }
            catch (Exception ex)
            {

                _logger.LogError("An error occurred while fetching store inventory.", ex);
                return StatusCode(500, new { success = false, message = "An internal server error occurred." });
            }

        }

        #endregion

        /// <summary>
        /// Gets the list of pending invoices for a given customer ID.
        /// </summary>
        /// <param name="clientId">The customer/client ID for whom pending invoices are to be retrieved.</param>
        /// <returns>
        /// A list of pending invoices for the specified client.
        /// </returns>
        /// <response code="200">Returns the pending invoices successfully</response>
        /// <response code="400">If an error occurs during processing</response>

        #region Post Methods
        [HttpPost("insert-inventory-package")]
        public async Task<IActionResult> InsertInventoryPackageAsync([FromBody] InventoryPackageModel model)
        {
            try
            {
                var response = await _service.InsertInventoryPackageAsync(
                    model.StoreId,
                    model.PackageNumber,
                    model.UserName,
                    model.Date
                );

                if (response.Success)
                {
                    return Ok(new { success = true, message = "Package inserted successfully." });
                }
                else
                {
                    return BadRequest(new { success = false, message = response.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("An error occurred while inserting inventory package.", ex);
                return StatusCode(500, new { success = false, message = "An internal server error occurred." });
            }
        }

        
        [HttpPost("delete-inventory-package")]
        public async Task<IActionResult> DeleteInventoryPackageAsync([FromBody] DeleteInventoryPackageRequest model)
        {
            try
            {
                var response = await _service.DeleteInventoryPackageAsync(model.StoreId, model.PackageNumber, model.DeleteAll);

                if (response.Success)
                    return Ok(new { success = true, message = response.Message });
                else
                    return BadRequest(new { success = false, message = response.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error occurred while deleting inventory package.", ex);
                return StatusCode(500, new { success = false, message = "An internal server error occurred." });
            }
        }



       
        [HttpPost("resend-package-notification")]
        public async Task<IActionResult> ResendPackageNotificationAsync([FromBody] ResendPackageNotificationRequest model)
        {
            try
            {
                var response = await _service.ResendPackageNotificationAsync(model.PackageNumber, model.DocumentType);

                if (response.Success)
                {
                    return Ok(new { success = true, message = response.Message });
                }
                else
                {
                    return BadRequest(new { success = false, message = response.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("Error occurred while resending package notification.", ex);
                return StatusCode(500, new { success = false, message = "An internal server error occurred." });
            }
        }

        [HttpPost("bulk-send-package-notification")]
        public async Task<IActionResult> BulkSendPackageNotification([FromBody] List<ResendPackageNotificationRequest> model)
        {
            try
            {
                var failedItems = new List<int>(); 

                foreach (var item in model)
                {
                    var response = await _service.ResendPackageNotificationAsync(item.PackageNumber, item.DocumentType);

                    if (!response.Success)
                    {
                        failedItems.Add(item.PackageNumber); 
                    }
                }

                if (failedItems.Any())
                {
                    return BadRequest(new
                    {
                        success = false,
                        message = "Some notifications failed.",
                        failedItems = failedItems
                    });
                }

                return Ok(new { success = true, message = "All notifications sent successfully." });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error occurred while resending package notifications.", ex);
                return StatusCode(500, new { success = false, message = "An internal server error occurred." });
            }
        }


        #endregion

        [HttpGet("GetExcel_StoreInventoryReport")]
        public async Task<IActionResult> GetExcel_SalesSummaryReport([FromQuery] int storeId, [FromQuery] string companyId)
        {
            GenericResponse<List<StoreInventoryReport>>? response;
            try
            {
                response = await _service.GetStoreInventoryAsync(storeId, companyId);
                var SalesSummaryData = response.Data;

                // Generate Excel file
                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Store Inventory Report");

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

                    // Merge Cells for Title
                    var titleRange = worksheet.Range("A1:P3");
                    titleRange.Merge();
                    titleRange.Value = "Inventory Report";
                    titleRange.Style.Font.Bold = true;
                    titleRange.Style.Font.FontSize = 14;
                    titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    titleRange.Style.Alignment.WrapText = true;

                    // Formatting Header Row (Row 4)
                    var headerRange = worksheet.Range("A4:P4");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Font.FontName = "Tahoma";
                    headerRange.Style.Font.FontSize = 10;
                    headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#4C68A2");
                    headerRange.Style.Font.FontColor = XLColor.White;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    // Add Headers
                    string[] headers = {
                                        "CUSTOMER",
                                        "STORE",
                                        "NAME",
                                        "PACKAGE",
                                        "PACKAGE STATUS",
                                        "INVOICE",
                                        "INVOICE STATUS",
                                        "PAYMENT TYPE",
                                        "ZONE",
                                        "STOP",
                                        "CREATED DATE",
                                        "TRANSPORT",
                                        "TRANSPORT TYPE",
                                        "DELIVERY TYPE",
                                        "DIFFERENCE",
                                        "ROUTE"
                                    };


                    for (int i = 0; i < headers.Length; i++)
                    {
                        worksheet.Cell(4, i + 1).Value = headers[i];
                    }

                    // Append Data
                    int row = 5;
                    foreach (var item in SalesSummaryData)
                    {
                        worksheet.Cell(row, 1).Value = item.Customer;
                        worksheet.Cell(row, 2).Value = item.Stop;
                        worksheet.Cell(row, 3).Value = item.Name;
                        worksheet.Cell(row, 4).Value = item.Package;
                        worksheet.Cell(row, 5).Value = item.PackageStatus;
                        worksheet.Cell(row, 6).Value = item.Invoice;
                        worksheet.Cell(row, 7).Value = item.InvoiceStatus;
                        worksheet.Cell(row, 8).Value = item.PaymentType;
                        worksheet.Cell(row, 9).Value = item.Zone;
                        worksheet.Cell(row, 10).Value = item.Stop;
                        worksheet.Cell(row, 11).Value = item.CreatedDate;
                        worksheet.Cell(row, 12).Value = item.Transport;
                        worksheet.Cell(row, 13).Value = item.TransportType;
                        worksheet.Cell(row, 14).Value = item.DeliveryType;
                        worksheet.Cell(row, 15).Value = item.Difference;
                        worksheet.Cell(row, 16).Value = item.Route;

                        row++;
                    }

                    // Enable text wrapping for all rows from row 5 onwards
                    worksheet.Range("A1:P" + row).Style.Alignment.WrapText = true;
                    worksheet.Range("A1:P" + row).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                    worksheet.Range("A1:P" + row).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

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
        
        [HttpGet("GetPDF_StoreInventoryReport")]
        public async Task<IActionResult> GetPDF_StoreInventoryReport([FromQuery] int storeId, [FromQuery] string companyId)
        {
            try
            {
                var response = await _service.GetStoreInventoryAsync(storeId, companyId);
                var data = response.Data;

                var htmlBuilder = new StringBuilder();
                htmlBuilder.Append("<html><head><style>");
                htmlBuilder.Append("table { width: 100%; border-collapse: collapse; font-family: Arial; font-size: 12px; }");
                htmlBuilder.Append("th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }");
                htmlBuilder.Append("th { background-color: #4C68A2; color: white; }");
                htmlBuilder.Append("</style></head><body>");
                htmlBuilder.Append("<h2>Store Inventory Report</h2>");
                htmlBuilder.Append("<table>");
                htmlBuilder.Append("<thead><tr>");

                string[] headers = {
            "CUSTOMER", "STORE", "NAME", "PACKAGE", "PACKAGE STATUS",
            "INVOICE", "INVOICE STATUS", "PAYMENT TYPE", "ZONE", "STOP",
            "CREATED DATE", "TRANSPORT", "TRANSPORT TYPE", "DELIVERY TYPE",
            "DIFFERENCE", "ROUTE"
        };

                foreach (var header in headers)
                    htmlBuilder.Append($"<th>{header}</th>");
                htmlBuilder.Append("</tr></thead><tbody>");

                foreach (var item in data)
                {
                    htmlBuilder.Append("<tr>");
                    htmlBuilder.Append($"<td>{item.Customer}</td>");
                    htmlBuilder.Append($"<td>{item.Stop}</td>");
                    htmlBuilder.Append($"<td>{item.Name}</td>");
                    htmlBuilder.Append($"<td>{item.Package}</td>");
                    htmlBuilder.Append($"<td>{item.PackageStatus}</td>");
                    htmlBuilder.Append($"<td>{item.Invoice}</td>");
                    htmlBuilder.Append($"<td>{item.InvoiceStatus}</td>");
                    htmlBuilder.Append($"<td>{item.PaymentType}</td>");
                    htmlBuilder.Append($"<td>{item.Zone}</td>");
                    htmlBuilder.Append($"<td>{item.Stop}</td>");
                    htmlBuilder.Append($"<td>{item.CreatedDate}</td>");
                    htmlBuilder.Append($"<td>{item.Transport}</td>");
                    htmlBuilder.Append($"<td>{item.TransportType}</td>");
                    htmlBuilder.Append($"<td>{item.DeliveryType}</td>");
                    htmlBuilder.Append($"<td>{item.Difference}</td>");
                    htmlBuilder.Append($"<td>{item.Route}</td>");
                    htmlBuilder.Append("</tr>");
                }

                htmlBuilder.Append("</tbody></table></body></html>");

                var converter = new SelectPdf.HtmlToPdf();
                var doc = converter.ConvertHtmlString(htmlBuilder.ToString());
                var pdfBytes = doc.Save();
                doc.Close();

                return File(pdfBytes, "application/pdf", "StoreInventory_Report.pdf");
            }
            catch (Exception ex)
            {
                _logger.LogError("PDF export failed", ex);
                return BadRequest("PDF export failed: " + ex.Message);
            }
        }


    }
}
