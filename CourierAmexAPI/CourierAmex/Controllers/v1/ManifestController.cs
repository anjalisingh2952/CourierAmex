using ClosedXML.Excel;
using CourierAmex.Extensions;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage.Domain;
using DocumentFormat.OpenXml.Spreadsheet;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.Design;
using System.Diagnostics.Contracts;
using System.Drawing;
using System.Net.Sockets;
using System.Reflection;
using System.Text;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class ManifestController : ControllerBase
    {
        private readonly ILogger<ManifestController> _logger;
        private readonly IManifestService _service;
        private readonly IInvoiceGenerateService _generateService;

        public ManifestController(ILogger<ManifestController> logger, IManifestService service, IInvoiceGenerateService invoiceGenerateService)
        {
            _logger = logger;
            _service = service;
            _generateService = invoiceGenerateService;
        }

        [HttpGet]
        public async Task<IActionResult> GetById([FromQuery] long id)
        {
            GenericResponse<ManifestModel>? response;
            try
            {
                response = await _service.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetManifestScanner")]
        public async Task<IActionResult> GetManifestScanner([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] int cid = 0)
        {
            PagedResponse<ManifestScanner>? response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetManifestScannerAsync(request, cid);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        //[HttpGet("GetManifestScanner")]
        //public async Task<IActionResult> GetManifestScannerWithoutPagination([FromQuery] int cid = 0)
        //{
        //    PagedResponse<ManifestScanner>? response;
        //    try
        //    {              

        //        response = await _service.GetManifestScannerWithoutPaginationAsync(cid);
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError("There was an error on 'GetManifestScannerWithoutPagination' invocation.", ex.Message);
        //        return StatusCode(400, ex.Message);
        //    }

        //    return Ok(response);
        //}

        [HttpGet("GetPendingPackages")]
        public async Task<IActionResult> GetPendingPackages([FromQuery] short ps, [FromQuery] short pi, [FromQuery] string? c, [FromQuery] string? s, [FromQuery] string mn)
        {
            PagedResponse<PendingPackageInfo>? response;
            try
            {
                var request = new FilterByRequest
                {
                    PageSize = ps,
                    PageIndex = pi,
                    Criteria = string.IsNullOrEmpty(c) ? "" : c,
                    SortBy = string.IsNullOrEmpty(s) ? "" : s
                };

                response = await _service.GetPendingPackagesAsync(request, mn);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetCountManifestScanner")]
        public async Task<IActionResult> GetCountManifestScanner(string mn)
        {
            GenericResponse<CountManifestScanner>? response;
            try
            {
                response = await _service.GetCountManifestScannerAsync(mn);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("Paged")]
        public async Task<IActionResult> GetPaged([FromQuery] FilterByRequest request)
        {
            PagedResponse<ManifestModel> response;
            try
            {
                response = await _service.GetPagedAsync(request);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_GetPaged' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ManifestModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<ManifestModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_Post' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("AddManifestPackage")]
        public async Task<IActionResult> AddManifestPackage([FromBody] AddManifestPackageRequest entity)
        {
            GenericResponse<AddManifestPackageResponse> response;
            try
            {
                response = await _service.AddManifestPackageAsync(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'AddManifestPackage' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut]
        public async Task<IActionResult> Put([FromBody] ManifestModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<ManifestModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.UpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_Put' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPatch("Open")]
        public async Task<IActionResult> Open([FromQuery] long id)
        {
            GenericResponse<ManifestModel> response = new();
            var context = HttpContext.GetWorkContext();
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.OpenAsync(id, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_Open' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpDelete]
        public async Task<IActionResult> Delete([FromQuery] long id)
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
                _logger.LogError("There was an error on 'Manifest_Delete' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetManifestsByPackageType")]
        public async Task<IActionResult> GetManifestsByPackageType([FromQuery] string CompanyId, [FromQuery] int State, [FromQuery] int ManifestType, [FromQuery] string Type)
        {
            GenericResponse<List<Manifest>>? response;
            try
            {
                response = await _service.GetManifestsByPackageTypeAsync(CompanyId, State, ManifestType, Type);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on '' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetScannedPackage")]
        public async Task<IActionResult> GetScannedPackage(string packageNumber, string manifestNumber)
        {
            GenericResponse<ScannedPackageInfo>? response;
            try
            {
                response = await _service.GetScannedPackageAsync(packageNumber, manifestNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("CreateScanLog")]
        public async Task<IActionResult> CreateScanLog([FromBody] ScanLogModel entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<ScanLogModel> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.CreateScanLogAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_Post' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("InsertRoute")]
        public async Task<IActionResult> InsertRoute([FromBody] RouteInsertModel entity)
        {
            var context = HttpContext.GetWorkContext();
            int response;
            try
            {
                response = await _service.InsertRoute(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'InsertRoute' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("RouteSheetDetail")]
        public async Task<IActionResult> RouteSheetDetail([FromQuery] int routeSheetId, [FromQuery] int status, [FromQuery] string companyId, [FromQuery] int? page, [FromQuery] int? index, [FromQuery] string? filter)
        {
            (List<RouteSheetDetailModel> List, int Total) response;
            try
            {
                response = await _service.GetRouteSheetDetail(routeSheetId, status, companyId, page, index, filter);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'RouteSheetDetail' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(new
            {
                list = response.List,
                total = response.Total
            });
        }

        [HttpGet("GetPackageByRouteReport")]
        public async Task<IActionResult> GetPackageByRouteReport([FromQuery] int routeSheetId)
        {
            List<RoutePackageReportModel> response;
            try
            {
                response = await _service.GetPackageByRouteReport(routeSheetId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'RouteSheetDetail' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        // Note :- routeSheet and Route Map is same thing
        [HttpGet("GetValidatePackageRoute")]
        public async Task<IActionResult> GetValidatePackageRoute([FromQuery] int packageNumber, [FromQuery] int roadMapId)
        {
            try
            {
                var response = await _service.GetValidatePackageRoute(packageNumber, roadMapId);

                if (response?.Data == null)
                {
                    return NotFound(new { success = false, message = "No data found." });
                }

                var (result, invoiced) = response.Data;

                return Ok(new
                {
                    success = true,
                    data = new
                    {
                        result,
                        invoiced
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error in 'GetValidatePackageRoute': {Message}", ex.Message);
                return StatusCode(500, new { success = false, message = "An error occurred." });
            }
        }

        [HttpGet("GetRoadMapsReport")]
        public async Task<IActionResult> GetRoadMapsReport([FromQuery] int roadMapId, [FromQuery] int companyId)
        {
            try
            {
                var response = await _service.GetRoadMapsReport(roadMapId, companyId);

                if (response?.Data == null)
                {
                    return NotFound(new { success = false, message = "No data found." });
                }

                return Ok(response?.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError("Error in 'GetValidatePackageRoute': {Message}", ex.Message);
                return StatusCode(500, new { success = false, message = "An error occurred." });
            }
        }

        [HttpPost("InsertNotification")]
        public async Task<IActionResult> InsertNotification([FromBody] List<InsertNotificationModel> insertNotifications)
        {
            try
            {
                var results = new List<object>();

                foreach (var notification in insertNotifications)
                {
                    var response = await _service.InsertNotification(
                        notification.PackageNumber,
                        notification.DocType,
                        notification.Status
                    );

                    if (response?.Data != null)
                    {
                        results.Add(response.Data);
                    }
                }

                if (results.Count == 0)
                {
                    return NotFound(new { success = false, message = "No data found." });
                }

                return Ok(new { success = true, data = results });
            }
            catch (Exception ex)
            {
                _logger.LogError("Error in 'InsertNotification': {Message}", ex.Message);
                return StatusCode(500, new { success = false, message = "An error occurred." });
            }
        }

        [HttpGet("GetParcelDeliveryReport")]
        public async Task<IActionResult> GetParcelDeliveryReport([FromQuery] int roadMapId, [FromQuery] int companyId)
        {
            try
            {
                var response = await _service.GetParcelDeliveryReport(roadMapId, companyId);

                if (response?.Data == null)
                {
                    return NotFound(new { success = false, message = "No data found." });
                }

                return Ok(response?.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError("Error in 'GetValidatePackageRoute': {Message}", ex.Message);
                return StatusCode(500, new { success = false, message = "An error occurred." });
            }
        }

        [HttpGet("PrepareRoadMapReport")]
        public async Task<IActionResult> PrepareRoadMapReport([FromQuery] int roadMapId, [FromQuery] int companyId)
        {
            var result = await GetRoadMapsReport(roadMapId, companyId);
            var parcelDeliveryReportResult = await GetParcelDeliveryReport(roadMapId, companyId);

            string parcelDeliveryHtml = "";
            if (parcelDeliveryReportResult is ObjectResult parcelObjectResult && parcelObjectResult.Value is List<ParcelDeliveryReportModel> parcelList)
            {
                parcelDeliveryHtml = await _generateService.CreateParcelDeliveryReportHtmlAsync(parcelList, null);
            }
            else
            {
                return BadRequest("Failed to retrieve Parcel Delivery Report data.");
            }

            if (result is ObjectResult objectResult && objectResult.Value is List<RoadMapstReportModel> packList)
            {
                var template = await _generateService.CreateRoadMapReportHtmlAsync(packList, null);

                var pdfResult = await _generateService.GeneratePdfFromHtmlAsync(template);
                var pdfResultForParcelDelivery = await _generateService.GeneratePdfFromHtmlAsync(parcelDeliveryHtml);

                return Ok(new { RoadMapReport = pdfResult, ParcelDeliveryReport = pdfResultForParcelDelivery });
            }

            return BadRequest("Failed to generate the report.");
        }

        [HttpGet("GetDeliveryTypes")]
        public async Task<IActionResult> GetDeliveryTypes()
        {
            GenericResponse<List<DeliveryTypesModel>> response;
            try
            {
                response = await _service.GetDeliveryTypes();
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetDeliveryTypes' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpDelete("DeletePackageFromRouteMap")]
        public async Task<IActionResult> DeletePackageFromRouteMap([FromBody] DeletePackageRequest param)
        {
            int response;
            try
            {
                response = await _service.DeletePackageFromRouteMap(param.PackageId, param.RoadMapId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'DeletePackageFromRouteMap' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut("PackageScanUpdate")]
        public async Task<IActionResult> PackageScanUpdate([FromBody] ScannedPackageInfo entity)
        {
            GenericResponse<int> response;
            try
            {
                response = await _service.PackageScanUpdateAsync(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_Put' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPost("UpdateRoadMapStatus")]
        public async Task<IActionResult> UpdateRoadMapStatus([FromBody] List<int> entity)
        {
            GenericResponse<int> response;
            try
            {
                response = await _service.UpdateRoadMapStatus(entity);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_Put' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpPut("PackageReassignUpdate")]
        public async Task<IActionResult> PackageReassignUpdate([FromBody] PackageReassign entity)
        {
            var context = HttpContext.GetWorkContext();
            GenericResponse<int> response;
            try
            {
                Guid userId = context != null ? Guid.Parse(context.Id) : Guid.Empty;
                response = await _service.PackageReassignUpdateAsync(entity, userId);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_Put' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetBagInfo")]
        public async Task<IActionResult> GetBagInfo(string bag)
        {
            GenericResponse<BagInfo>? response;
            try
            {
                response = await _service.GetBagInfoAsync(bag);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'Manifest_GetById' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetManifestIdByPackageNumber")]
        public async Task<IActionResult> GetManifestIdByPackageNumber(string _packagenumber)
        {
            GenericResponse<int> response;
            try
            {
                response = await _service.GetManifestIdByPackageNumberAsync(_packagenumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetManifestIdByPackageNumber' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetManifestGenralInformation")]
        public async Task<IActionResult> GetManifestGenralInformation([FromQuery] int companyId, [FromQuery] string manifestNumber)
        {
            GenericResponse<ManifestReport_GeneralInfo>? response;
            try
            {
                response = await _service.GetManifestGenralInformationAsync(companyId, manifestNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetManifestGenralInformation' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetManifestBillingInformation")]
        public async Task<IActionResult> GetManifestBillingInformation([FromQuery] int companyId, [FromQuery] string manifestNumber)
        {
            GenericResponse<List<ManifestReport_BillingInfo>>? response;
            try
            {
                response = await _service.GetManifestBillingInformationAsync(companyId, manifestNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetManifestBillingInformation' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        
        
        #region Public Methods

        [HttpGet("GetExcel_ManifestReport")]
        public async Task<IActionResult> GetExcel_ManifestReport([FromQuery] int companyId, [FromQuery] string manifestNumber)
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "ManifestReportTemplate.xlsx");
            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet(1); // Get the first worksheet

                worksheet.Column(8).Width = 12; // Column B
                worksheet.Column(9).Width = 12; // Column C
                worksheet.Column(10).Width = 12; // Column D


                GenericResponse<ManifestReport_ExcelData> response = await _service.GetManifestReportExcelDataAsync(companyId, manifestNumber);

                // Define placeholder replacements
                var replacements = new Dictionary<string, string>
                {
                    { "{{Company}}", response.Data.GeneralInfo.Country },
                    { "{{Manifest Number}}", response.Data.GeneralInfo.ManifestNumber },
                    { "{{Address}}", response.Data.GeneralInfo.Address },
                    { "{{Date}}",response.Data.GeneralInfo.Date.ToString() }
                };

                // Find the last used row
                int lastRow = 5;

                var lastGuide = "";
                var lastCustomer = "";
                decimal groupWeightTotal = 0.00m;
                decimal groupVolumeTotal = 0.00m;
                decimal groupCubicTotal = 0.00m;

                decimal guiaWeightTotal = 0.00m;
                decimal guiaVolumeTotal = 0.00m;
                decimal guiaCubicTotal = 0.00m;
                int guiaPackageTotal = 0;

                foreach (var item in response.Data.BillingData)
                {
                    if (lastGuide != item.ChildGuide)
                    {
                        if (lastGuide != "" && lastGuide != item.ChildGuide)
                        {
                            lastRow = AddGroupTotal(worksheet, lastRow, groupWeightTotal, groupVolumeTotal, groupCubicTotal);
                            guiaWeightTotal += groupWeightTotal;
                            guiaVolumeTotal += groupVolumeTotal;
                            guiaCubicTotal += groupCubicTotal;
                            groupWeightTotal = 0.00m;
                            groupVolumeTotal = 0.00m;
                            groupCubicTotal = 0.00m;

                            lastRow++;
                            lastRow = AddGuiaTotal(worksheet, lastRow, guiaWeightTotal, guiaVolumeTotal, guiaCubicTotal, guiaPackageTotal);
                            guiaWeightTotal = 0.00m;
                            guiaVolumeTotal = 0.00m;
                            guiaCubicTotal = 0.00m;
                            guiaPackageTotal = 0;

                            lastRow++;
                        }
                        lastRow = AddGuide(worksheet, lastRow, item);
                        if (lastCustomer == "")
                        {
                            lastRow++;
                        }

                    }
                    if (lastCustomer != item.CustomerName)
                    {
                        if (lastCustomer != "" && lastCustomer != item.CustomerName)
                        {
                            if (lastGuide == item.ChildGuide)
                            {
                                lastRow = AddGroupTotal(worksheet, lastRow, groupWeightTotal, groupVolumeTotal, groupCubicTotal);
                                guiaWeightTotal += groupWeightTotal;
                                guiaVolumeTotal += groupVolumeTotal;
                                guiaCubicTotal += groupCubicTotal;
                                groupWeightTotal = 0.00m;
                                groupVolumeTotal = 0.00m;
                                groupCubicTotal = 0.00m;
                            }
                            lastRow++;
                        }
                        lastGuide = item.ChildGuide;
                        lastCustomer = item.CustomerName;
                        lastRow = AddHeader(worksheet, lastRow);
                    }

                    groupWeightTotal += item.Weight;
                    groupVolumeTotal += item.VolumeWeight;
                    groupCubicTotal += item.CubicFeet;
                    lastRow = AddData(worksheet, lastRow, item);
                    guiaPackageTotal++;
                }

                lastRow = AddGroupTotal(worksheet, lastRow, groupWeightTotal, groupVolumeTotal, groupCubicTotal);
                lastRow++;
                lastRow = AddGuiaTotal(worksheet, lastRow, guiaWeightTotal, guiaVolumeTotal, guiaCubicTotal, guiaPackageTotal);

                // Iterate through all used cells
                foreach (var cell in worksheet.CellsUsed())
                {
                    string cellValue = cell.GetString();

                    foreach (var placeholder in replacements)
                    {
                        if (cellValue.Contains(placeholder.Key))
                        {
                            cell.Value = cellValue.Replace(placeholder.Key, placeholder.Value);
                        }
                    }
                }

                int sheetLastRow = worksheet.Column(2).CellsUsed().Max(c => c.Address.RowNumber);
                var range = worksheet.Range($"B6:J{lastRow}").CellsUsed();

                range.Style.Border.TopBorder = XLBorderStyleValues.Thin;
                range.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
                range.Style.Border.LeftBorder = XLBorderStyleValues.Thin;
                range.Style.Border.RightBorder = XLBorderStyleValues.Thin;

                // Save the modified file
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "PackageItems.xlsx");
                }

            }
        }

        #endregion


        #region Public Methods

        [HttpGet("GetExcel_ManifestReportObservation")]
        public async Task<IActionResult> GetExcel_ManifestReportObservation([FromQuery] int companyId, [FromQuery] string manifestNumber)
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "ManifestReportObservationTemplate.xlsx");
            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet(1); // Get the first worksheet

                worksheet.Column(5).Width = 30; // Column B
                worksheet.Column(6).Width = 20; // Column C
                worksheet.Column(7).Width = 30; // Column C
                worksheet.Column(8).Width = 12; // Column C
                worksheet.Column(9).Width = 12; // Column C

                GenericResponse<ManifestReport_ExcelData> response = await _service.GetManifestReportExcelDataAsync(companyId, manifestNumber);

                // Define placeholder replacements
                var replacements = new Dictionary<string, string>
                {
                    { "{{Company}}", response.Data.GeneralInfo.Country },
                    { "{{Manifest Number}}", response.Data.GeneralInfo.ManifestNumber },
                    { "{{Address}}", response.Data.GeneralInfo.Address },
                    { "{{Date}}",response.Data.GeneralInfo.Date.ToString() }
                };

                // Find the last used row
                int lastRow = 5;

                var lastGuide = "";
                var lastCustomer = "";
                decimal groupWeightTotal = 0.00m;
                decimal groupVolumeTotal = 0.00m;
                decimal groupCubicTotal = 0.00m;

                decimal guiaWeightTotal = 0.00m;
                decimal guiaVolumeTotal = 0.00m;
                decimal guiaCubicTotal = 0.00m;
                int guiaPackageTotal = 0;

                foreach (var item in response.Data.BillingData)
                {
                    if (lastGuide != item.ChildGuide)
                    {
                        if (lastGuide != "" && lastGuide != item.ChildGuide)
                        {
                            lastRow = AddGroupTotal(worksheet, lastRow, groupWeightTotal, groupVolumeTotal, groupCubicTotal, true);
                            guiaWeightTotal += groupWeightTotal;
                            guiaVolumeTotal += groupVolumeTotal;
                            guiaCubicTotal += groupCubicTotal;
                            groupWeightTotal = 0.00m;
                            groupVolumeTotal = 0.00m;
                            groupCubicTotal = 0.00m;

                            lastRow++;
                            lastRow = AddGuiaTotal(worksheet, lastRow, guiaWeightTotal, guiaVolumeTotal, guiaCubicTotal, guiaPackageTotal, true);
                            guiaWeightTotal = 0.00m;
                            guiaVolumeTotal = 0.00m;
                            guiaCubicTotal = 0.00m;
                            guiaPackageTotal = 0;

                            lastRow++;
                        }
                        lastRow = AddGuide(worksheet, lastRow, item, true);
                        if (lastCustomer == "")
                        {
                            lastRow++;
                        }

                    }
                    if (lastCustomer != item.CustomerName)
                    {
                        if (lastCustomer != "" && lastCustomer != item.CustomerName)
                        {
                            if (lastGuide == item.ChildGuide)
                            {
                                lastRow = AddGroupTotal(worksheet, lastRow, groupWeightTotal, groupVolumeTotal, groupCubicTotal, true);
                                guiaWeightTotal += groupWeightTotal;
                                guiaVolumeTotal += groupVolumeTotal;
                                guiaCubicTotal += groupCubicTotal;
                                groupWeightTotal = 0.00m;
                                groupVolumeTotal = 0.00m;
                                groupCubicTotal = 0.00m;
                            }
                            lastRow++;
                        }
                        lastGuide = item.ChildGuide;
                        lastCustomer = item.CustomerName;
                        lastRow = AddHeader(worksheet, lastRow, true);
                    }

                    groupWeightTotal += item.Weight;
                    groupVolumeTotal += item.VolumeWeight;
                    groupCubicTotal += item.CubicFeet;
                    lastRow = AddData(worksheet, lastRow, item, true);
                    guiaPackageTotal++;
                }

                lastRow = AddGroupTotal(worksheet, lastRow, groupWeightTotal, groupVolumeTotal, groupCubicTotal, true);
                lastRow++;
                lastRow = AddGuiaTotal(worksheet, lastRow, guiaWeightTotal, guiaVolumeTotal, guiaCubicTotal, guiaPackageTotal, true);

                // Iterate through all used cells
                foreach (var cell in worksheet.CellsUsed())
                {
                    string cellValue = cell.GetString();

                    foreach (var placeholder in replacements)
                    {
                        if (cellValue.Contains(placeholder.Key))
                        {
                            cell.Value = cellValue.Replace(placeholder.Key, placeholder.Value);
                        }
                    }
                }

                int sheetLastRow = worksheet.Column(2).CellsUsed().Max(c => c.Address.RowNumber);
                var range = worksheet.Range($"B6:J{lastRow}").CellsUsed();

                range.Style.Border.TopBorder = XLBorderStyleValues.Thin;
                range.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
                range.Style.Border.LeftBorder = XLBorderStyleValues.Thin;
                range.Style.Border.RightBorder = XLBorderStyleValues.Thin;

                // Save the modified file
                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    var content = stream.ToArray();
                    return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "PackageItems.xlsx");
                }

            }
        }
        #endregion


        #region Private Methods

        private int AddGroupTotal(IXLWorksheet worksheet, int lastRow, decimal wt, decimal vt, decimal ct, Boolean isObservation = false)
        {
            lastRow++;
            worksheet.Row(lastRow).Style.Font.FontSize = 8;
            worksheet.Row(lastRow).Style.Font.Bold = true;
            worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";

            worksheet.Cell(lastRow, 7).Value = "Partial Weight:";
            worksheet.Cell(lastRow, 8).Value = wt.ToString("0.00");
            worksheet.Cell(lastRow, 9).Value = vt.ToString("0.00");
            if (!isObservation)
                worksheet.Cell(lastRow, 10).Value = ct.ToString("0.00");

            worksheet.Cell(lastRow, 7).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 8).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 9).Style.Fill.BackgroundColor = XLColor.LightGray;
            if (!isObservation)
                worksheet.Cell(lastRow, 10).Style.Fill.BackgroundColor = XLColor.LightGray;
            return lastRow;
        }


        private int AddBagGroupTotal(IXLWorksheet worksheet, int lastRow, decimal wt, decimal vt, decimal ct, Boolean isObservation = false)
        {
            lastRow++;
            worksheet.Row(lastRow).Style.Font.FontSize = 8;
            worksheet.Row(lastRow).Style.Font.Bold = true;
            worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";

            worksheet.Cell(lastRow, 7).Value = "Partial Weight:";
            worksheet.Cell(lastRow, 8).Value = wt.ToString("0.00");
            worksheet.Cell(lastRow, 9).Value = vt.ToString("0.00");


            worksheet.Cell(lastRow, 7).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 8).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 9).Style.Fill.BackgroundColor = XLColor.LightGray;

            return lastRow;
        }
     
        private int AddGuiaTotal(IXLWorksheet worksheet, int lastRow, decimal g_wt, decimal g_vt, decimal g_ct, int pt, Boolean isObservation = false)
        {
            lastRow++;
            worksheet.Row(lastRow).Style.Font.FontSize = 11;
            worksheet.Row(lastRow).Style.Font.Bold = true;
            //worksheet.Row(lastRow).Style.Font.FontColor = XLColor.White;
            worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";

            worksheet.Cell(lastRow, 5).Value = "Packages:";
            worksheet.Cell(lastRow, 6).Value = pt.ToString();
            worksheet.Cell(lastRow, 7).Value = "Total Weight:";
            worksheet.Cell(lastRow, 8).Value = g_wt.ToString("0.00");
            worksheet.Cell(lastRow, 9).Value = g_vt.ToString("0.00");
            if (!isObservation)
                worksheet.Cell(lastRow, 10).Value = g_ct.ToString("0.00");

            worksheet.Cell(lastRow, 5).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 6).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 7).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 8).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 9).Style.Fill.BackgroundColor = XLColor.LightGray;
            if (!isObservation)
                worksheet.Cell(lastRow, 10).Style.Fill.BackgroundColor = XLColor.LightGray;
            return lastRow;
        }

        private int AddBagTotal(IXLWorksheet worksheet, int lastRow, decimal g_wt, decimal g_vt, decimal g_ct, int pt, Boolean isObservation = false)
        {
            lastRow++;
            worksheet.Row(lastRow).Style.Font.FontSize = 11;
            worksheet.Row(lastRow).Style.Font.Bold = true;
            worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";

            // Display total weight, volume, etc.
            worksheet.Cell(lastRow, 2).Value = "Total Weight:";
            worksheet.Cell(lastRow, 3).Value = g_wt.ToString("0.00");
            worksheet.Cell(lastRow, 4).Value = "Total Volume:";
            worksheet.Cell(lastRow, 5).Value = g_vt.ToString("0.00");
            worksheet.Cell(lastRow, 6).Value = "Total Count:";
            worksheet.Cell(lastRow, 7).Value = pt.ToString();

            // Style the cells to match the format
            worksheet.Cell(lastRow, 2).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 3).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 4).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 5).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 6).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 7).Style.Fill.BackgroundColor = XLColor.LightGray;

            return lastRow;
        }

        private int AddGuide(IXLWorksheet worksheet, int lastRow, ManifestReport_BillingInfo item, Boolean isObservation = false)
        {
            lastRow++;
            worksheet.Row(lastRow).Style.Font.FontSize = 12;
            worksheet.Row(lastRow).Style.Font.Bold = true;
            //worksheet.Row(lastRow).Style.Font.FontColor = XLColor.White;
            worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";

            worksheet.Cell(lastRow, 2).Value = "Guía Hija:";
            worksheet.Cell(lastRow, 2).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 3).Value = item.ChildGuide;
            worksheet.Cell(lastRow, 3).Style.Fill.BackgroundColor = XLColor.LightGray;
            return lastRow;
        }

        private int AddBag(IXLWorksheet worksheet, int lastRow, ManifestReport_BagInfo item, string count, string weight, string volume)
        {
            lastRow++;
            worksheet.Row(lastRow).Style.Font.FontSize = 12;
            worksheet.Row(lastRow).Style.Font.Bold = true;
            worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";


            string formattedWeight = decimal.TryParse(weight, out decimal weightDecimal) ? weightDecimal.ToString("F2") : weight;
            string formattedVolume = decimal.TryParse(volume, out decimal volumeDecimal) ? volumeDecimal.ToString("F2") : volume;


            worksheet.Cell(lastRow, 2).Value = "Bag:";
            worksheet.Cell(lastRow, 3).Value = item.Bag;
            worksheet.Cell(lastRow, 4).Value = "Count:";
            worksheet.Cell(lastRow, 5).Value = count;
            worksheet.Cell(lastRow, 6).Value = "Weight/Volume:";
            worksheet.Cell(lastRow, 7).Value = $"{formattedWeight} / {formattedVolume}";
            worksheet.Cell(lastRow, 8).Value = "";
            worksheet.Cell(lastRow, 9).Value = "";
            worksheet.Cell(lastRow, 10).Value = "";


            worksheet.Cell(lastRow, 2).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 3).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 4).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 5).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 6).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 7).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 8).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 9).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 10).Style.Fill.BackgroundColor = XLColor.LightGray;

            return lastRow;
        }

        private static int AddData(IXLWorksheet worksheet, int lastRow, ManifestReport_BillingInfo item, Boolean isObservation = false)
        {
            lastRow++; // Move to the next available row
            worksheet.Row(lastRow).Style.Font.FontSize = 10;
            worksheet.Row(lastRow).Style.Font.Bold = false;
            worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";


            worksheet.Cell(lastRow, 2).Value = item.PackageNumbers == "" ? "N/A" : item.PackageNumbers;
            worksheet.Cell(lastRow, 3).Value = item.CustomerName == "" ? "N/A" : item.CustomerName;
            worksheet.Cell(lastRow, 4).Value = item.Courier == "" ? "N/A" : item.Courier;
            worksheet.Cell(lastRow, 5).Value = item.Origin == "" ? "N/A" : item.Origin;
            worksheet.Cell(lastRow, 6).Value = item.CourierNumber == "" ? "N/A" : item.CourierNumber;
            worksheet.Cell(lastRow, 7).Value = item.Description == "" ? "N/A" : item.Description;
            worksheet.Cell(lastRow, 8).Value = item.Weight;
            worksheet.Cell(lastRow, 9).Value = item.VolumeWeight;
            if (!isObservation)
                worksheet.Cell(lastRow, 10).Value = item.CubicFeet;

            if (isObservation)
            {
                lastRow++; // Move to the next available row
                worksheet.Row(lastRow).Style.Font.FontSize = 10;
                worksheet.Row(lastRow).Style.Font.Bold = true;
                worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";

                worksheet.Cell(lastRow, 2).Value = "Observaciones:";
                worksheet.Cell(lastRow, 3).Value = "";
                worksheet.Cell(lastRow, 4).Value = "";
                worksheet.Cell(lastRow, 5).Value = "";
                worksheet.Cell(lastRow, 6).Value = "";
                worksheet.Cell(lastRow, 7).Value = "";
                worksheet.Cell(lastRow, 8).Value = "";
                worksheet.Cell(lastRow, 9).Value = "";

                worksheet.Range($"C{lastRow}:I{lastRow}").Merge();
                worksheet.Range($"C{lastRow}:I{lastRow}").Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                worksheet.Range($"C{lastRow}:I{lastRow}").Style.Border.InsideBorder = XLBorderStyleValues.Thin;
                worksheet.Range($"C{lastRow}:I{lastRow}").Style.Border.OutsideBorderColor = XLColor.Black;
                worksheet.Range($"C{lastRow}:I{lastRow}").Style.Border.InsideBorderColor = XLColor.Black;

            }

            return lastRow;
        }

        private static int AddBagData(IXLWorksheet worksheet, int lastRow, ManifestReport_BagInfo item, Boolean isObservation = false)
        {
            lastRow++; // Move to the next available row
            worksheet.Row(lastRow).Style.Font.FontSize = 10;
            worksheet.Row(lastRow).Style.Font.Bold = false;
            worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";


            worksheet.Cell(lastRow, 2).Value = item.PackageNumbers == "" ? "N/A" : item.PackageNumbers;
            worksheet.Cell(lastRow, 3).Value = item.CustomerName == "" ? "N/A" : item.CustomerName;
            worksheet.Cell(lastRow, 4).Value = item.Courier == "" ? "N/A" : item.Courier;
            worksheet.Cell(lastRow, 5).Value = item.Origin == "" ? "N/A" : item.Origin;
            worksheet.Cell(lastRow, 6).Value = item.CourierName == "" ? "N/A" : item.CourierName;
            worksheet.Cell(lastRow, 7).Value = item.Description == "" ? "N/A" : item.Description;
            worksheet.Cell(lastRow, 8).Value = item.Weight;
            worksheet.Cell(lastRow, 9).Value = item.VolumeWeight;
            worksheet.Cell(lastRow, 10).Value = item.Classification;

            if (isObservation)
            {
                lastRow++; // Move to the next available row
                worksheet.Row(lastRow).Style.Font.FontSize = 10;
                worksheet.Row(lastRow).Style.Font.Bold = true;
                worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
                worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";

                worksheet.Cell(lastRow, 2).Value = "Observaciones:";
                worksheet.Cell(lastRow, 3).Value = "";
                worksheet.Cell(lastRow, 4).Value = "";
                worksheet.Cell(lastRow, 5).Value = "";
                worksheet.Cell(lastRow, 6).Value = "";
                worksheet.Cell(lastRow, 7).Value = "";
                worksheet.Cell(lastRow, 8).Value = "";
                worksheet.Cell(lastRow, 9).Value = "";
                worksheet.Cell(lastRow, 10).Value = "";

                worksheet.Range($"C{lastRow}:I{lastRow}").Merge();
                worksheet.Range($"C{lastRow}:I{lastRow}").Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                worksheet.Range($"C{lastRow}:I{lastRow}").Style.Border.InsideBorder = XLBorderStyleValues.Thin;
                worksheet.Range($"C{lastRow}:I{lastRow}").Style.Border.OutsideBorderColor = XLColor.Black;
                worksheet.Range($"C{lastRow}:I{lastRow}").Style.Border.InsideBorderColor = XLColor.Black;

            }

            return lastRow;
        }

        private static int AddHeader(IXLWorksheet worksheet, int lastRow, Boolean isObservation = false)
        {
            lastRow++; // Move to the next available row
            worksheet.Row(lastRow).Style.Font.FontSize = 10;
            worksheet.Row(lastRow).Style.Font.Bold = true;
            worksheet.Row(lastRow).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Left;
            worksheet.Row(lastRow).Style.Font.FontName = "Tahoma";

            if (!isObservation)
            {
                worksheet.Cell(lastRow, 2).Value = "Tracking";
                worksheet.Cell(lastRow, 3).Value = "Customer";
                worksheet.Cell(lastRow, 4).Value = "Courier";
                worksheet.Cell(lastRow, 5).Value = "Origin";
                worksheet.Cell(lastRow, 6).Value = "Courier Number";
                worksheet.Cell(lastRow, 7).Value = "Description";
                worksheet.Cell(lastRow, 8).Value = "Weight";
                worksheet.Cell(lastRow, 9).Value = "Volume";
                worksheet.Cell(lastRow, 10).Value = "Cubic Feet";
            }
            else
            {
                worksheet.Cell(lastRow, 2).Value = "Tracking";
                worksheet.Cell(lastRow, 3).Value = "Cliente";
                worksheet.Cell(lastRow, 4).Value = "Courier";
                worksheet.Cell(lastRow, 5).Value = "Procedencia";
                worksheet.Cell(lastRow, 6).Value = "Nombre Courier";
                worksheet.Cell(lastRow, 7).Value = "Descripción";
                worksheet.Cell(lastRow, 8).Value = "Peso";
                worksheet.Cell(lastRow, 9).Value = "Volumen";
            }

            worksheet.Cell(lastRow, 2).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 3).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 4).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 5).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 6).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 7).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 8).Style.Fill.BackgroundColor = XLColor.LightGray;
            worksheet.Cell(lastRow, 9).Style.Fill.BackgroundColor = XLColor.LightGray;
            if (!isObservation)
                worksheet.Cell(lastRow, 10).Style.Fill.BackgroundColor = XLColor.LightGray;
            return lastRow;
        }

        private int AddBagSummaryRow(IXLWorksheet sheet, int row, string bagNumber, List<ManifestReport_BagInfo> items)
        {
            decimal totalWeight = items.Sum(i => i.Weight);
            decimal totalVolume = items.Sum(i => i.VolumeWeight);
            int count = items.Count;
            string category = items.FirstOrDefault()?.Category ?? "";

            var summary = $"Bag: {bagNumber}  Count: {count}  Weight/Volume: {totalWeight:0.00} {totalVolume:0.00} {category}";
            sheet.Cell(row, 2).Value = summary;
            sheet.Range(row, 2, row, 10).Merge().Style.Font.Bold = true;

            return row + 1;
        }

        private int AddBagHeaderRow(IXLWorksheet sheet, int row)
        {
            sheet.Cell(row, 2).Value = "Tracking Number";
            sheet.Cell(row, 3).Value = "Customer";
            sheet.Cell(row, 4).Value = "Courier Code";
            sheet.Cell(row, 5).Value = "Origin";
            sheet.Cell(row, 6).Value = "Courier Name";
            sheet.Cell(row, 7).Value = "Description";
            sheet.Cell(row, 8).Value = "Weight";
            sheet.Cell(row, 9).Value = "Volume";
            sheet.Cell(row, 10).Value = "Classification";


            var headerRange = sheet.Range(row, 2, row, 10);
            headerRange.Style.Font.Bold = true;
            headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

            return row;
        }

        #endregion

        #region Public Methods

        [HttpGet("GetExcel_ManifestReportByBag")]
        public async Task<IActionResult> GetExcel_ManifestReportByBag([FromQuery] int companyId, [FromQuery] string manifestNumber)
        {
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "ManifestReportTemplate_Bag.xlsx");

            using (var workbook = new XLWorkbook(filePath))
            {
                var worksheet = workbook.Worksheet(1);

                var response = await _service.GetManifestReportByBagExcelDataAsync(companyId, manifestNumber);
                if (response == null || response.Data == null || response.Data.BagBillingData == null || !response.Data.BagBillingData.Any())
                {
                    // Keep headers, clear only data section
                    worksheet.Rows(7, 1000).Clear();

                    // Optional: Add message
                    worksheet.Cell("B7").Value = "No data available for the selected Manifest.";
                    worksheet.Range("B7:J7").Merge();
                    worksheet.Range("B7:J7").Style.Font.SetBold();
                    worksheet.Range("B7:J7").Style.Font.FontColor = XLColor.Red;
                    worksheet.Range("B7:J7").Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                    using var emptyStream = new MemoryStream();
                    workbook.SaveAs(emptyStream);
                    return File(emptyStream.ToArray(),
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                "ManifestReportByBag.xlsx");
                }



                var replacements = new Dictionary<string, string>
        {
            { "{{Company}}", response.Data.GeneralInfo.Country },
            { "{{Manifest Number}}", response.Data.GeneralInfo.ManifestNumber },
            { "{{Address}}", response.Data.GeneralInfo.Address },
            { "{{Date}}", response.Data.GeneralInfo.Date.ToString("yyyy-MM-dd HH:mm:ss") }
        };

                int lastRow = 5;
                var lastGuide = "";
                var lastCustomer = "";
                decimal groupWeightTotal = 0.00m;
                decimal groupVolumeTotal = 0.00m;
                decimal groupCubicTotal = 0.00m;

                decimal bagWeightTotal = 0.00m;
                decimal bagVolumeTotal = 0.00m;
                decimal bagCubicTotal = 0.00m;
                int bagPackageTotal = 0;

                foreach (var item in response.Data.BagBillingData)
                {
                    if (lastGuide != item.Bag)
                    {
                        if (lastGuide != "" && lastGuide != item.Bag)
                        {
                            lastRow = AddBagGroupTotal(worksheet, lastRow, groupWeightTotal, groupVolumeTotal, groupCubicTotal, false);
                            bagWeightTotal += groupWeightTotal;
                            bagVolumeTotal += groupVolumeTotal;
                            bagCubicTotal += groupCubicTotal;
                            groupWeightTotal = 0.00m;
                            groupVolumeTotal = 0.00m;
                            groupCubicTotal = 0.00m;

                            lastRow++;
                            lastRow = AddBagTotal(worksheet, lastRow, bagWeightTotal, bagVolumeTotal, bagCubicTotal, bagPackageTotal, false);
                            bagWeightTotal = 0.00m;
                            bagVolumeTotal = 0.00m;
                            bagCubicTotal = 0.00m;
                            bagPackageTotal = 0;

                            lastRow++;
                        }

                        var clientsGroup = response.Data.BagBillingData.Where(x => x.Bag == item.Bag);

                        decimal clientWeightTotal = clientsGroup.Sum(x => x.Weight);
                        decimal clientVolumeTotal = clientsGroup.Sum(x => x.VolumeWeight);
                        decimal clientCubicTotal = clientsGroup.Count();

                        lastRow = AddBag(worksheet, lastRow, item, clientCubicTotal.ToString(), clientWeightTotal.ToString(), clientVolumeTotal.ToString());

                        if (lastCustomer == "")
                        {
                            lastRow++;
                        }
                    }

                    if (lastCustomer != item.CustomerName)
                    {
                        if (lastCustomer != "" && lastCustomer != item.CustomerName)
                        {
                            if (lastGuide == item.Bag)
                            {
                                lastRow = AddBagGroupTotal(worksheet, lastRow, groupWeightTotal, groupVolumeTotal, groupCubicTotal, false);
                                bagWeightTotal += groupWeightTotal;
                                bagVolumeTotal += groupVolumeTotal;
                                bagCubicTotal += groupCubicTotal;
                                groupWeightTotal = 0.00m;
                                groupVolumeTotal = 0.00m;
                                groupCubicTotal = 0.00m;
                                lastRow++;
                            }
                            lastRow++;
                        }
                        lastGuide = item.Bag;
                        lastCustomer = item.CustomerName;
                        lastRow = AddBagHeaderRow(worksheet, lastRow);
                    }

                    groupWeightTotal += item.Weight;
                    groupVolumeTotal += item.VolumeWeight;
                    groupCubicTotal += item.CubicFeet;
                    lastRow = AddBagData(worksheet, lastRow, item, false);
                    bagPackageTotal++;
                }

                lastRow = AddBagGroupTotal(worksheet, lastRow, groupWeightTotal, groupVolumeTotal, groupCubicTotal, false);
                lastRow++;
                lastRow = AddBagTotal(worksheet, lastRow, bagWeightTotal, bagVolumeTotal, bagCubicTotal, bagPackageTotal, false);

                foreach (var cell in worksheet.CellsUsed())
                {
                    string cellValue = cell.GetString();
                    foreach (var placeholder in replacements)
                    {
                        if (cellValue.Contains(placeholder.Key))
                        {
                            cell.Value = cellValue.Replace(placeholder.Key, placeholder.Value);
                        }
                    }
                }

                var range = worksheet.Range($"B6:J{lastRow}").CellsUsed();
                range.Style.Border.TopBorder = XLBorderStyleValues.Thin;
                range.Style.Border.BottomBorder = XLBorderStyleValues.Thin;
                range.Style.Border.LeftBorder = XLBorderStyleValues.Thin;
                range.Style.Border.RightBorder = XLBorderStyleValues.Thin;

                using var stream = new MemoryStream();
                workbook.SaveAs(stream);
                return File(stream.ToArray(),
                            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                            "ManifestReportByBag.xlsx");
            }
        }

        [HttpGet("GetManifestPreAlert")]
        public async Task<IActionResult> GetManifestPreAlert([FromQuery] int companyId, [FromQuery] string manifestNumber)
        {
            GenericResponse<List<ManifestPreAlert>>? response;
            try
            {
                response = await _service.GetManifestPreAlertAsync(companyId, manifestNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetManifestBillingInformation' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetExcel_ManifestPreAlert")]
        public async Task<IActionResult> GetExcel_ManifestPreAlert([FromQuery] int companyId, [FromQuery] string manifestNumber)
        {
            GenericResponse<List<ManifestPreAlert>>? response;
            try
            {
                response = await _service.GetManifestPreAlertAsync(companyId, manifestNumber);

                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Package Items");

                    var properties = typeof(ManifestPreAlert).GetProperties();

                    int colIndex = 1;

                    worksheet.Row(1).Height = 30;

                    // Add headers
                    for (int i = 0; i < properties.Length; i++)
                    {
                        var displayName = properties[i].GetCustomAttribute<DisplayAttribute>()?.Name ?? properties[i].Name;
                        worksheet.Cell(1, colIndex).Value = displayName;

                        worksheet.Cell(1, colIndex).Style.Alignment.WrapText = true;
                        worksheet.Cell(1, colIndex).Style.Font.FontSize = 11;
                        worksheet.Cell(1, colIndex).Style.Font.Bold = true;
                        worksheet.Cell(1, colIndex).Style.Font.FontColor = XLColor.White;
                        worksheet.Cell(1, colIndex).Style.Fill.BackgroundColor = XLColor.FromArgb(76, 104, 162);
                        worksheet.Cell(1, colIndex).Style.Font.FontName = "Tahoma";
                        worksheet.Column(colIndex).Width = 13;


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
                            worksheet.Cell(row, colIndex).Value = properties[col].GetValue(item)?.ToString() ?? "";
                            worksheet.Cell(row, colIndex).Style.Font.FontSize = 10;
                            worksheet.Cell(row, colIndex).Style.Font.Bold = false;
                            worksheet.Cell(row, colIndex).Style.Font.FontName = "Tahoma";
                            worksheet.Cell(row, colIndex).Style.Font.FontColor = XLColor.FromArgb(77, 77, 77);
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
                _logger.LogError("There was an error on 'GetManifestBillingInformation' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetExcel_DeconsolidationReport")]
        public async Task<IActionResult> GenerateCourierDeconsolidationReportExcel([FromQuery] int companyId, [FromQuery] int manifestId, [FromQuery] decimal freightValue, [FromQuery] string category)
        {
            try
            {
                // Fetch data from the service

                if (category == "true") { category = "D"; } else { category = ""; }
                var response = await _service.GetCourierDeconsolidationDataAsync(companyId, manifestId, freightValue, category);
                var deconsolidationData = response.Data;

                // Generate Excel file
                using (var workbook = new XLWorkbook())
                {
                    var worksheet = workbook.Worksheets.Add("Deconsolidation Courier");


                    // Formatting Header Row (Row 5)
                    var headerRange = worksheet.Range("A1:O1");
                    headerRange.Style.Font.Bold = true;
                    headerRange.Style.Font.FontName = "Tahoma";
                    headerRange.Style.Font.FontSize = 12;
                    headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#4C68A2");
                    headerRange.Style.Font.FontColor = XLColor.White;
                    headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    headerRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

                    // Add Headers
                    string[] headers = { "Master", "Sec.M", "Guía", "Consignatario", "Cédula", "Tipo", "Bultos", "Peso", "Descripción", "Categoria", "Remitente", "Moneda", "FOB", "Flete", "Ubc.Destino" };
                    for (int i = 0; i < headers.Length; i++)
                    {
                        worksheet.Cell(1, i + 1).Value = headers[i];

                        if (i + 1 == 4 || i + 1 == 5 || i + 1 == 9)
                        {
                            worksheet.Column(i + 1).Width = 20;
                        }
                        else
                        {
                            worksheet.Column(i + 1).Width = 15;
                        }
                    }

                    // Append Data
                    int row = 2;
                    foreach (var item in deconsolidationData)
                    {
                        worksheet.Cell(row, 1).Value = item.ManifestNumber;
                        worksheet.Cell(row, 2).Value = item.SecM;
                        worksheet.Cell(row, 3).Value = item.PackageNumber;
                        worksheet.Cell(row, 4).Value = item.Customer;
                        worksheet.Cell(row, 5).Value = item.Courier;
                        worksheet.Cell(row, 6).Value = item.TypeOfIdentification;
                        worksheet.Cell(row, 7).Value = item.Packages;
                        worksheet.Cell(row, 8).Value = item.Weight;
                        worksheet.Cell(row, 9).Value = item.Description;
                        worksheet.Cell(row, 10).Value = item.Category;
                        worksheet.Cell(row, 11).Value = item.Origin;
                        worksheet.Cell(row, 12).Value = item.Currency;
                        worksheet.Cell(row, 13).Value = item.FOBValue;
                        worksheet.Cell(row, 14).Value = item.FreightValue;
                        worksheet.Cell(row, 15).Value = item.DestinationLocation;
                        row++;
                    }

                    // Enable text wrapping for all rows from row 5 onwards
                    worksheet.Range("A1:O" + row).Style.Alignment.WrapText = true;
                    worksheet.Range("A1:O" + row).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                    worksheet.Range("A1:O" + row).Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

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
                _logger.LogError("There was an error on 'GenerateCourierDeconsolidationReportExcel' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
        }

        [HttpGet("GetPackageManifestInfo")]
        public async Task<IActionResult> GetPackageManifestInfo([FromQuery] int companyId, [FromQuery] int PackageNumber)
        {
            PackageManifestInfoModel? response = new();
            try
            {
                response = await _service.GetPackageManifestInfo(companyId, PackageNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetPackageManifestInfo' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetFilterRouteSheet")]
        public async Task<IActionResult> GetFilterRouteSheet([FromQuery] string? manifestId, [FromQuery] string? zoneCode, [FromQuery] int? status, [FromQuery] int? PageSize, [FromQuery] int? PageIndex, [FromQuery] string? Filter)
        {
            List<RouteSheetModel>? response = new();
            try
            {
                manifestId = manifestId == "null" ? null : manifestId;
                response = await _service.GetFilterRouteSheet(manifestId, zoneCode, status, PageSize, PageIndex, Filter);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetFilterRouteSheet' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        [HttpGet("GetExcel_PackagingCourierReport")]
        public async Task<IActionResult> GetExcel_PackagingCourierReport([FromQuery] int companyId, [FromQuery] string manifestNumber)
        {
            var response = await _service.GetPackagingCourierReportAsync(companyId, manifestNumber);

            if (!response.Success || response.Data == null || !response.Data.Any())
            {
                return NotFound("No data found for the given manifest.");
            }

            var firstItem = response.Data.First();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Courier Packaging Report");


            var titleRange6 = worksheet.Range("A2:C7");
            titleRange6.Merge();
            titleRange6.Style.Font.SetBold();
            titleRange6.Style.Font.FontSize = 12;
            titleRange6.Style.Font.FontColor = XLColor.Black;
            titleRange6.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left);
            titleRange6.Style.Alignment.SetVertical(XLAlignmentVerticalValues.Top);
            titleRange6.Style.Alignment.WrapText = true;
            titleRange6.Value =
                "Date: " + DateTime.Now.ToString("MM/dd/yyyy hh:mm tt") + Environment.NewLine +
                "Manifest Number: " + firstItem.ManifestNumber + Environment.NewLine +
                "Total Packages: " + response.Data.Sum(x => x.PackageCount) + Environment.NewLine +
                "Total Seals: " + firstItem.TotalSeals + Environment.NewLine +
                "Pending Packages: " + firstItem.PendingPackages;

            var titleRange5 = worksheet.Range("D2:G7");
            titleRange5.Merge();
            titleRange5.Style.Font.SetBold();
            titleRange5.Style.Font.FontSize = 12;
            titleRange5.Style.Font.FontColor = XLColor.Black;
            titleRange5.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Left);
            titleRange5.Style.Alignment.SetVertical(XLAlignmentVerticalValues.Top);
            titleRange5.Style.Alignment.WrapText = true;
            titleRange5.Value =
                "System Gross: " + response.Data.Sum(x => x.SystemGrossWeight) + Environment.NewLine +
                "Physical Gross: " + response.Data.Sum(x => x.PhysicalGrossWeight) + Environment.NewLine +
                "System Volume: " + response.Data.Sum(x => x.SystemVolWeight) + Environment.NewLine +
                "Physical Volume: " + response.Data.Sum(x => x.PhysicalVolWeight);


            var titleRange7 = worksheet.Range("A1:G1");
            titleRange7.Merge();
            titleRange7.Value = "Courier Packaging Report";
            titleRange7.Style.Font.SetBold();
            titleRange7.Style.Font.FontSize = 18;
            titleRange7.Style.Font.FontColor = XLColor.Black;

            titleRange7.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);


            var headerRow = 9;
            worksheet.Cell(headerRow, 1).Value = "Seal Number";
            worksheet.Cell(headerRow, 2).Value = "Package Qty";
            worksheet.Cell(headerRow, 3).Value = "Dimensions";
            worksheet.Cell(headerRow, 4).Value = "System Gross Weight";
            worksheet.Cell(headerRow, 5).Value = "System Volume Weight";
            worksheet.Cell(headerRow, 6).Value = "Physical Gross Weight";
            worksheet.Cell(headerRow, 7).Value = "Physical Volume Weight";

            var headerRange = worksheet.Range(headerRow, 1, headerRow, 7);
            headerRange.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#4990e2"));
            headerRange.Style.Font.FontColor = XLColor.White;
            headerRange.Style.Font.SetBold();
            headerRange.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
            headerRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            headerRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;

            // Data Rows
            int row = headerRow + 1;
            foreach (var item in response.Data)
            {
                worksheet.Cell(row, 1).Value = item.SealNumber;
                worksheet.Cell(row, 2).Value = item.PackageCount;
                worksheet.Cell(row, 3).Value = item.Dimensions;
                worksheet.Cell(row, 4).Value = item.SystemGrossWeight;
                worksheet.Cell(row, 5).Value = item.SystemVolWeight;
                worksheet.Cell(row, 6).Value = item.PhysicalGrossWeight;
                worksheet.Cell(row, 7).Value = item.PhysicalVolWeight;

                for (int col = 1; col <= 7; col++)
                {
                    var cell = worksheet.Cell(row, col);
                    cell.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
                    cell.Style.Alignment.SetVertical(XLAlignmentVerticalValues.Center);
                    cell.Style.Alignment.WrapText = true;
                }

                row++;

            }

            // Adjust column widths for spacing
            worksheet.Columns(1, 7).Width = 22;

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();

            return File(content,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                "PackagingCourierReportTemplate.xlsx");
        }

        [HttpGet("GetExcel_PackagingConsolidatedReport")]
        public async Task<IActionResult> GetExcel_PackagingConsolidatedReport([FromQuery] string manifestNumber, [FromQuery] int companyId)
        {
            var result = await _service.GetPackagingConsolidatedReportAsync(manifestNumber, companyId);

            var response = result.Data.mainData;
            var generalInfo = result.Data.GeneralInfo;


            var firstItem = response.FirstOrDefault();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Packaging Consolidated Report");

            var titleRange = worksheet.Range("A1:G1");
            titleRange.Merge();
            titleRange.Value = "Packaging Consolidated Report";
            titleRange.Style.Font.SetBold();
            titleRange.Style.Font.FontSize = 18;
            titleRange.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);




            var generalInfoRange = worksheet.Range("A8:C13");
            generalInfoRange.Merge();
            generalInfoRange.Style.Alignment.WrapText = true;
            generalInfoRange.Style.Alignment.SetVertical(XLAlignmentVerticalValues.Top);
            //generalInfoRange.Style.Font.SetBold();
            generalInfoRange.Value = "Address: " + generalInfo?.Address + Environment.NewLine;



            var metaRange = worksheet.Range("E8:G13");
            metaRange.Merge();
            metaRange.Style.Alignment.WrapText = true;
            metaRange.Style.Alignment.SetVertical(XLAlignmentVerticalValues.Top);
            //metaRange.Style.Font.SetBold();
            metaRange.Value =
                "Total Packages: " + response.Sum(x => x.TotalPackages) + Environment.NewLine +
                "Total Weight: " + response.Sum(x => x.TotalWeight) + Environment.NewLine +
                "Total Vol. Weight: " + response.Sum(x => x.TotalVolumetricWeight);

            var titleRange1 = worksheet.Range("E2:G6");
            titleRange1.Merge();
            titleRange1.Style.Alignment.WrapText = true;
            titleRange1.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
            //titleRange1.Style.Font.SetBold();
            titleRange1.Value =
                "REF NO: " + manifestNumber + Environment.NewLine +
                "MAWB: " + manifestNumber + Environment.NewLine +
               "Departure: " + firstItem?.DepartureAirport + Environment.NewLine +
               "Destination: " + firstItem?.DestinationAirport;



            var titleRange2 = worksheet.Range("A2:C6");
            titleRange2.Merge();
            titleRange2.Style.Alignment.WrapText = true;
            titleRange2.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
            //titleRange2.Style.Font.SetBold();
            titleRange2.Value =

               "DIRECT SHIPPING INC: " + firstItem?.Shipper;


            var titleRange3 = worksheet.Range("D2:D13");
            titleRange3.Merge();
            var titleRange4 = worksheet.Range("A7:C7");
            titleRange4.Merge();
            var titleRange5 = worksheet.Range("E7:G7");
            titleRange5.Merge();


            // Header row
            int headerRow = 14;
            worksheet.Cell(headerRow, 1).Value = "Sub-Guide Number";

            worksheet.Cell(headerRow, 2).Value = "Carrier Address";
            worksheet.Cell(headerRow, 3).Value = "Shipper";
            worksheet.Cell(headerRow, 4).Value = "Consignee Info";
            worksheet.Cell(headerRow, 5).Value = "Total Weight";
            worksheet.Cell(headerRow, 6).Value = "Total Volumetric Weight";
            worksheet.Cell(headerRow, 7).Value = "Total Packages";


            var headerRange = worksheet.Range(headerRow, 1, headerRow, 7);
            headerRange.Style.Fill.SetBackgroundColor(XLColor.FromHtml("#4990e2"));
            headerRange.Style.Font.FontColor = XLColor.White;
            headerRange.Style.Font.SetBold();
            headerRange.Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);

            if (result.Data.mainData.Any())
            {



                int row = headerRow + 1;
                foreach (var item in response)
                {
                    worksheet.Cell(row, 1).Value = item.SubGuideNumber;
                    worksheet.Cell(row, 2).Value = item.CarrierAddress;
                    worksheet.Cell(row, 3).Value = item.Shipper;
                    worksheet.Cell(row, 4).Value = item.ConsigneeInfo;
                    worksheet.Cell(row, 5).Value = item.TotalWeight;
                    worksheet.Cell(row, 6).Value = item.TotalVolumetricWeight;
                    worksheet.Cell(row, 7).Value = item.TotalPackages;


                    for (int col = 1; col <= 7; col++)
                    {
                        worksheet.Cell(row, col).Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
                        worksheet.Cell(row, col).Style.Alignment.SetVertical(XLAlignmentVerticalValues.Center);
                        worksheet.Cell(row, col).Style.Alignment.WrapText = true;
                    }

                    row++;
                }
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            var content = stream.ToArray();

            return File(content,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"PackagingConsolidatedReportTemplate.xlsx");
        }
        #endregion
    }
}
