using ClosedXML.Excel;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Storage.Domain;
using CourierAmex.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class PendingManifestOrPreStudyController : ControllerBase
    {
        private readonly ILogger<PendingManifestOrPreStudyController> _logger;
        private readonly IPendingManifestOrPreStudyService _service;

        public PendingManifestOrPreStudyController(ILogger<PendingManifestOrPreStudyController> logger, IPendingManifestOrPreStudyService service)
        {
            _logger = logger;
            _service = service;
        }



        [HttpGet("GetExcel_ManifestReportInvoices")]
        public async Task<IActionResult> GetExcel_ManifestReportInvoices([FromQuery] int companyid, [FromQuery] string startDate, [FromQuery] string endDate, [FromQuery] string reportType)
        {
            GenericResponse<List<PendingManifestOrPreStudyModel>>? response;
            try
            {
                string dateFormat = "MM-dd-yyyy";

                // Parse the date using DateTime.ParseExact
                DateTime _startdate = DateTime.ParseExact(startDate, dateFormat, CultureInfo.InvariantCulture);
                DateTime _enddate = DateTime.ParseExact(endDate, dateFormat, CultureInfo.InvariantCulture);
                response = await _service.Get_PendingManifestOrPreStudyAsync(companyid, _startdate, _enddate, reportType);

                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("ReportePendientesPrevio");

                    // Apply column widths
                    worksheet.Column("A").Width = 12;
                    worksheet.Column("B").Width = 15;
                    worksheet.Column("C").Width = 13;
                    worksheet.Column("D").Width = 17;
                    worksheet.Column("E").Width = 17;
                    worksheet.Column("F").Width = 20;
                    worksheet.Column("G").Width = 13;
                    worksheet.Column("H").Width = 20;
                    worksheet.Column("I").Width = 13;
                    worksheet.Column("J").Width = 13;
                    worksheet.Column("K").Width = 13;
                    worksheet.Column("L").Width = 13;
                    worksheet.Column("M").Width = 13;
                    worksheet.Column("N").Width = 13;

                    // Merge A1:D3 for Image Placement


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


                    // Merge Cells for Title
                    var titleRange = worksheet.Range("E1:H2");
                    titleRange.Merge();
                    titleRange.Value = "AMERICAN EXPORT";
                    titleRange.Style.Font.Bold = true;
                    titleRange.Style.Font.FontSize = 14;
                    titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    titleRange.Style.Alignment.WrapText = true;

                    // Merge Cells for Subtitle
                    var subtitleRange = worksheet.Range("E3:H4");
                    subtitleRange.Merge();
                    subtitleRange.Value = "Paquetes Pendientes de Previo";
                    subtitleRange.Style.Font.Bold = true;
                    subtitleRange.Style.Font.FontSize = 12;
                    subtitleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    subtitleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    subtitleRange.Style.Alignment.WrapText = true;

                    // Merge Cells for Date
                    var dateRange = worksheet.Range("E5:H5");
                    dateRange.Merge();
                    dateRange.Value = "FECHA: " + DateTime.Now.ToString("MM/dd/yyyy");
                    dateRange.Style.Font.FontSize = 10;
                    dateRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    dateRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                    dateRange.Style.Alignment.WrapText = true;

                    // Formatting Header Row (Row 7)
                    var headerRange = worksheet.Range("A7:N7");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Font.FontName = "Tahoma";
                    headerRange.Style.Font.FontSize = 11;


                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;

                    // Set Row 7 Height to Double
                    worksheet.Row(7).Height = worksheet.Row(7).Height * 2;

                    // Add Headers
                    string[] headers = { "Numero", "Cliente", "Nombre", "Fecha Ingreso", "Courier", "Descripcion", "Procedencia", "Peso", "Peso Volumetrico", "Precio", "Observaciones" };
                    for (int i = 0; i < headers.Length; i++)
                    {
                        worksheet.Cell(7, i + 1).Value = headers[i];
                    }

                    // Append Data
                    int row = 8;
                    foreach (var item in response.Data)
                    {
                        worksheet.Cell(row, 1).Value = item.Package;
                        worksheet.Cell(row, 2).Value = item.Customer;
                        worksheet.Cell(row, 3).Value = item.Name;
                        worksheet.Cell(row, 4).Value = item.EntryDate;
                        worksheet.Cell(row, 5).Value = item.Courier;
                        worksheet.Cell(row, 6).Value = item.Description;
                        worksheet.Cell(row, 7).Value = item.Origin;
                        worksheet.Cell(row, 8).Value = item.Weight;
                        worksheet.Cell(row, 9).Value = item.VolumetricWeight;
                        worksheet.Cell(row, 10).Value = item.Price;
                        worksheet.Cell(row, 11).Value = item.Observations;
                        row++;
                    }

                    // Enable text wrapping for all rows from row 7 onwards
                    worksheet.Range("A7:N" + row).Style.Alignment.WrapText = true;

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", (reportType == "preStudy" ? "PreStudyReport" : "PendingManifest") + ".xlsx");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetExcel_ManifestReportInvoices' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
        }
    }

}