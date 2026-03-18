using ClosedXML.Excel;
using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Storage.Domain;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class PackageItemController : ControllerBase
    {
        private readonly ILogger<PackageItemController> _logger;
        private readonly IPackageItemService _service;

        public PackageItemController(ILogger<PackageItemController> logger, IPackageItemService service)
        {
            _logger = logger;
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromQuery] int id)
        {
            GenericResponse<PackageItemModel>? response;
            try
            {
                response = await _service.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int pn = 0)
        {
            PagedResponse<PackageItemModel> response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetPagedAsync(request, pn);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] PackageItemModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackageItemModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_Post' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody] PackageItemModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<PackageItemModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_Put' invocation.", ex.Message);
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
                response = await _service.DeleteAsync(id, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_Delete' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetPackageItems-PreStudy")]
        public async Task<IActionResult> GetPackageItems_PreStudy([FromQuery] string manifestNumber = "", [FromQuery] string packageNumbers = "", [FromQuery] int companyid = 0)
        {
            PagedResponse<PackageItemModel_PreviousReport_PreStudy> response = new();
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = 100,
                    PageIndex = 1,
                    Criteria = "",
                    SortBy = ""
                };

                response = await _service.GetPackageItems_PreStudyAsync(request, manifestNumber, packageNumbers, companyid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetExcel-PackageItems-PreStudy")]
        public async Task<IActionResult> GetExcel_PackageItems_PreStudy([FromQuery] string manifestNumber = "", [FromQuery] string packageNumbers = "", [FromQuery] int companyid = 0)
        {
            PagedResponse<PackageItemModel_PreviousReport_PreStudy> response = new();
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = 1000000,
                    PageIndex = 1,
                    Criteria = "",
                    SortBy = ""
                };

                response = await _service.GetPackageItems_PreStudyAsync(request, manifestNumber, packageNumbers, companyid);
                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Package Items");

                    string[] col_7px = ["brand", "model","bag", "series","style","size", "color"];
                    string[] col_20px = ["description", "characteristics"];
                    string[] col_Ignore = ["totalrows", "id", "packagedescription","packageprice"];
                    string[] col_bgGreen = ["quantity", "description", "characteristics", "brand", "model", "unit cost", "price"];
                    string[] col_bgYellow = ["bag", "series", "style", "color", "size", "composition", "source","origin","status"];
                    string[] col_fontMaroon = ["customer", "tracking", "quantity", "item"];

                    var properties = typeof(PackageItemModel_PreviousReport_PreStudy).GetProperties();

                    int colIndex = 1;

                    worksheet.Row(1).Height = 30;

                    // Add headers
                    for (int i = 0; i < properties.Length; i++)
                    {
                        if (col_Ignore.Contains(properties[i].Name.Trim().ToLower()))
                            continue;

                        var displayName = properties[i].GetCustomAttribute<DisplayAttribute>()?.Name ?? properties[i].Name;
                        worksheet.Cell(1, colIndex).Value = displayName;

                        if (col_20px.Contains(displayName.Trim().ToLower()))
                        {
                            worksheet.Column(colIndex).Width = 20; // Wider column for description
                        }
                        else if (col_7px.Contains(displayName.Trim().ToLower()))
                        {
                            worksheet.Column(colIndex).Width = 9; // Wider column for description
                        }
                        else
                        {
                            worksheet.Column(colIndex).Width = 12; // Default width for others
                        }

                        if (col_bgGreen.Contains(displayName.Trim().ToLower()))
                        {
                            worksheet.Cell(1, colIndex).Style.Fill.BackgroundColor = XLColor.LightGreen;
                        }
                        if (col_bgYellow.Contains(displayName.Trim().ToLower()))
                        {
                            worksheet.Cell(1, colIndex).Style.Fill.BackgroundColor = XLColor.Yellow;
                        }
                        if (col_fontMaroon.Contains(displayName.Trim().ToLower()))
                        {
                            worksheet.Cell(1, colIndex).Style.Font.FontColor = XLColor.Maroon;
                        }

                        worksheet.Cell(1, colIndex).Style.Alignment.WrapText = true;
                        worksheet.Cell(1, colIndex).Style.Font.Bold = true;

                        colIndex++; // Only increment for valid columns
                    }

                    
                    // Add data rows
                    int row = 2;
                    foreach (var item in response.Data)
                    {
                        colIndex = 1;
                        worksheet.Row(row).Style.Alignment.WrapText = true;
                        for (int col = 0; col < properties.Length; col++)
                        {
                            if (col_Ignore.Contains(properties[col].Name.Trim().ToLower()))
                                continue;
                            worksheet.Cell(row, colIndex).Value = properties[col].GetValue(item)?.ToString() ?? "";
                            colIndex++;
                        }
                        row++;
                    }

                    var usedRange = worksheet.RangeUsed(); 
                    usedRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                    usedRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
                    usedRange.Style.Border.OutsideBorderColor = XLColor.LightGray;
                    usedRange.Style.Border.InsideBorderColor = XLColor.LightGray;
                    usedRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Top;
                    usedRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;


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
                _logger.LogError("Error generating Excel: {Message}", ex.Message);
                return StatusCode(500, "An error occurred while generating the Excel file.");
            }
        }

        [HttpPut("UpdateBillingDetails")]
        public async Task<IActionResult> UpdateBillingDetails([FromBody] PackageItemModel_PreviousReport_PreStudy entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<int> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateBillingDetailsAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Package_Put' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }
    }
}