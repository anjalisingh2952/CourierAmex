using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using ClosedXML.Excel;
using System.Drawing;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class SupplierController : ControllerBase
    {
        private readonly ILogger<SupplierController> _logger;
        private readonly ISupplierService _service;

        public SupplierController(ILogger<SupplierController> logger, ISupplierService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet("All")]
        public async Task<IActionResult> GetByCompany([FromQuery] int cid = 0)
        {
            IEnumerable<SupplierModel> response;
            try
            {
                response = await _service.GetByCompanyAsync(cid);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'Supplier_GetByCompany' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromQuery] int id)
        {
            GenericResponse<SupplierModel>? response;
            try
            {
                response = await _service.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'Supplier_GetById' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int cid = 0)
        {
            PagedResponse<SupplierModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetPagedAsync(request, cid);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'Supplier_GetPaged' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] SupplierModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<SupplierModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'Supplier_Post' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody] SupplierModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<SupplierModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'Supplier_Put' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] int id)
        {
            GenericResponse<bool> response = new();
            var context = HttpContext.GetWorkContext();
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                await _service.DeleteAsync(id, userId);
                response.Success = true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"There was an error on 'Supplier_Delete' invocation. {ex.Message}");
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

       
        [HttpGet("GetExcel_PurchasesReport")]
        public async Task<IActionResult> GetExcel_PurchasesReport([FromQuery] DateTime startDate, [FromQuery] DateTime endDate, [FromQuery] int companyId)
        {
            var response = await _service.GetPurchasesReportAsync(startDate, endDate, companyId);

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Purchases Report");

                worksheet.Columns().Width = 20;

                var titleRange1 = worksheet.Range("A1:B3");
                titleRange1.Merge();
                titleRange1.Value = " ";
                titleRange1.Style.Font.Bold = true;
                titleRange1.Style.Font.FontSize = 14;
                titleRange1.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                titleRange1.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                // Title Row with Date Range
                var titleText = $"Purchases Report\n Consultation from {startDate:MM/dd/yyyy} to {endDate:MM/dd/yyyy}";
                var titleRange2 = worksheet.Range("C1:J3");
                titleRange2.Merge();
                titleRange2.Value = titleText;
                titleRange2.Style.Font.Bold = true;
                titleRange2.Style.Font.FontSize = 14;
                titleRange2.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                titleRange2.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                var dateRange = worksheet.Range("K1:L3");
                dateRange.Merge();
                dateRange.Value = $"Generated on: {DateTime.Now:MM/dd/yyyy hh:mm:ss tt}";
                dateRange.Style.Font.FontSize = 12;
                dateRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
                dateRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;

                // Headers (in English)
                var headers = new string[]
                {
            "ENTRY CODE", "SUPPLIER CODE", "SUPPLIER NAME", "PAYMENT NOTE", "ENTRY DETAIL",
            "INVOICE DATE", "SUBTOTAL", "EXEMPT", "TAXABLE", "PARAFISCAL CONTRIBUTION",
            "TOTAL", "VAT %"
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
                        worksheet.Cell(row, 1).Value = item.EntryCode;
                        worksheet.Cell(row, 2).Value = item.SupplierCode;
                        worksheet.Cell(row, 3).Value = item.SupplierName;
                        worksheet.Cell(row, 4).Value = item.PaymentNote;
                        worksheet.Cell(row, 5).Value = item.EntryDetail;
                        worksheet.Cell(row, 6).Value = item.EntryDate.ToString("yyyy-MM-dd");
                        worksheet.Cell(row, 7).Value = item.SubtotalAmount;
                        worksheet.Cell(row, 8).Value = item.ExemptAmount;
                        worksheet.Cell(row, 9).Value = item.TaxedAmount;
                        worksheet.Cell(row, 10).Value = item.ParaFiscalContribution;
                        worksheet.Cell(row, 11).Value = item.TotalAmount;
                        worksheet.Cell(row, 12).Value = item.VATPercentage;

                        // Style for Data Cells
                        for (int col = 1; col <= 12; col++)
                        {
                            worksheet.Cell(row, col).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                            worksheet.Cell(row, col).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                        }

                        row++;
                    }

                    worksheet.Range("A5:L" + row).Style.Alignment.WrapText = true;
                    worksheet.Range("A5:L" + row).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    worksheet.Range("A5:L" + row).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                }

                // Save Excel File to Stream
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Purchases_Report.xlsx");
                }
            }
        }


    }
}
