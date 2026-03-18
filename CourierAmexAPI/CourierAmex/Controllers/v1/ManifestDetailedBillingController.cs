using ClosedXML.Excel;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage.Domain;
using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Drawing.Charts;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.IO.Packaging;

namespace CourierAmex.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize(AuthenticationSchemes = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme)]
    public class ManifestDetailedBilingController : ControllerBase
    {
        private readonly ILogger<ManifestDetailedBilingController> _logger;
        private readonly IManifestDetailedBillingService _service;

        public ManifestDetailedBilingController(ILogger<ManifestDetailedBilingController> logger, IManifestDetailedBillingService service)
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
        [HttpGet("GetManifestDetailedBilingData")]
        public async Task<IActionResult> GetManifestDetailedBilingData([FromQuery] int companyid, [FromQuery] string manifestNumber)
        {
            GenericResponse<List<Manifestdetail>> _Manifestdetails;
            GenericResponse<List<AverageManifest>> _ManifestAverage;
            GenericResponse<List<ManifestProvider>> _ManifestSupplier;
            try
            {
                // Fetch data for all three sheets
                _ManifestAverage = await _service.GetManifestAverageByKilogramAsync(companyid, manifestNumber); // Assuming manifestId is 0 for now
                _ManifestSupplier = await _service.GetManifestDetailBySupplierAsync(companyid, manifestNumber); // Assuming manifestId is 0 for now
                _Manifestdetails = await _service.GetManifestProductsDetailAsync(companyid, manifestNumber); // Assuming manifestId is 0 for now

                var result = new ManifestDetailedBiling
                {
                    Manifestdetails = _Manifestdetails.Data ?? new List<Manifestdetail>(),
                    ManifestSupplier = _ManifestSupplier.Data ?? new List<ManifestProvider>(),
                    ManifestAverage = _ManifestAverage.Data ?? new List<AverageManifest>()
                };

                // Return as a generic response
                var response = new GenericResponse<ManifestDetailedBiling>
                {
                    Data = result,
                    Success = true
                };


                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetManifestDetailedBilingData' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }
        }

        [HttpGet("GetExcel_ManifestDetailedBilingInvoices")]
        public async Task<IActionResult> GetExcel_ManifestDetailedBilingInvoices([FromQuery] int companyid, [FromQuery] string manifestNumber)
        {
            try
            {


                // Fetch data for all three sheets
                var manifestAverageResponse = await _service.GetManifestAverageByKilogramAsync(companyid, manifestNumber); // Assuming manifestId is 0 for now
                var manifestSupplierResponse = await _service.GetManifestDetailBySupplierAsync(companyid, manifestNumber); // Assuming manifestId is 0 for now
                var manifestDetailResponse = await _service.GetManifestProductsDetailAsync(companyid, manifestNumber); // Assuming manifestId is 0 for now

                using (var workbook = new XLWorkbook())
                {
                    // Sheet 1: Manifiesto Promedio
                    var promedioSheet = workbook.Worksheets.Add("Manifest Average");
                    AddPromedioSheetHeaders(promedioSheet);
                    AddPromedioSheetData(promedioSheet, manifestAverageResponse.Data);

                    // Sheet 2: Manifiesto Proveedor
                    var proveedorSheet = workbook.Worksheets.Add("Manifest Supplier");
                    AddProveedorSheetHeaders(proveedorSheet);
                    AddProveedorSheetData(proveedorSheet, manifestSupplierResponse.Data);

                    // Sheet 3: Manifiesto Detalle
                    var detalleSheet = workbook.Worksheets.Add("Manifest Detail");
                    AddDetalleSheetHeaders(detalleSheet);
                    AddDetalleSheetData(detalleSheet, manifestDetailResponse.Data);

                    using (var stream = new MemoryStream())
                    {
                        workbook.SaveAs(stream);
                        var content = stream.ToArray();
                        return File(content, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Manifest_Detailed_Billing_" + manifestNumber.Replace(" ", "_") + ".xlsx");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetExcel_ManifestReportInvoices' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
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
        [HttpGet("GetManifestProducts")]
        public async Task<IActionResult> GetManifestProducts([FromQuery] int companyid, [FromQuery] string manifestNumber = "")
        {
            GenericResponse<List<ManifestProducts>> response;
            try
            {
                response = await _service.GetManifestProductsAsync(companyid, manifestNumber);
            }
            catch (Exception ex)
            {
                _logger.LogError("There was an error on 'GetManifestProducts' invocation.", ex.Message);
                return StatusCode(400, ex.Message);
            }

            return Ok(response);
        }

        #region Private Methods

   
        private void AddPromedioSheetHeaders(IXLWorksheet worksheet)
        {
            worksheet.Cell(1, 1).Value = "Manifest Number";
            worksheet.Cell(1, 2).Value = "Weight";
            worksheet.Cell(1, 3).Value = "Volume";
            worksheet.Cell(1, 4).Value = "Quantity";
            worksheet.Cell(1, 5).Value = "Total Billed";
            worksheet.Cell(1, 6).Value = "Total Cost";
            worksheet.Cell(1, 7).Value = "Freight Cost";
            worksheet.Cell(1, 8).Value = "Parafiscal Contribution";
            worksheet.Cell(1, 9).Value = "Customs Tax";
            worksheet.Cell(1, 10).Value = "Average Kg";

            // Apply formatting
            var headerRange = worksheet.Range("A1:J1");
            headerRange.Style.Font.Bold = true;

            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        private void AddPromedioSheetData(IXLWorksheet worksheet, List<AverageManifest> data)
        {
            int row = 2;
            foreach (var item in data)
            {
                worksheet.Cell(row, 1).Value = item.ManifestNumber;
                worksheet.Cell(row, 2).Value = item.Weight;
                worksheet.Cell(row, 3).Value = item.Volume;
                worksheet.Cell(row, 4).Value = item.TotalBilled;
                worksheet.Cell(row, 5).Value = item.TotalCost;
                worksheet.Cell(row, 6).Value = item.FreightCost;
                worksheet.Cell(row, 7).Value = item.ParafiscalContribution;
                worksheet.Cell(row, 8).Value = item.CustomsTax;
                worksheet.Cell(row, 9).Value = item.AverageKg;
                row++;
            }
        }

        private void AddProveedorSheetHeaders(IXLWorksheet worksheet)
        {
            worksheet.Cell(1, 1).Value = "Supplier COD";
            worksheet.Cell(1, 2).Value = "Supplier";
            worksheet.Cell(1, 3).Value = "Currency";
            worksheet.Cell(1, 4).Value = "Amount";

            // Apply formatting
            var headerRange = worksheet.Range("A1:D1");
            headerRange.Style.Font.Bold = true;

            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        private void AddProveedorSheetData(IXLWorksheet worksheet, List<ManifestProvider> data)
        {
            int row = 2;
            foreach (var item in data)
            {
                worksheet.Cell(row, 1).Value = item.SupplierCOD;
                worksheet.Cell(row, 2).Value = item.Supplier;
                worksheet.Cell(row, 3).Value = item.Currency;
                worksheet.Cell(row, 4).Value = item.Amount;
                row++;
            }
        }

        private void AddDetalleSheetHeaders(IXLWorksheet worksheet)
        {
            worksheet.Cell(1, 1).Value = "Full Name";
            worksheet.Cell(1, 2).Value = "Manifest Number";
            worksheet.Cell(1, 3).Value = "Invoice Number";
            worksheet.Cell(1, 4).Value = "Date";
            worksheet.Cell(1, 5).Value = "Freight Volume";
            worksheet.Cell(1, 6).Value = "Internation Freight Flet";
            worksheet.Cell(1, 7).Value = "Handling";
            worksheet.Cell(1, 8).Value = "Customs Taxes";
            worksheet.Cell(1, 9).Value = "VAT";
            worksheet.Cell(1, 10).Value = "CrManagement";
            worksheet.Cell(1, 11).Value = "Package-Evision Previous Exam";
            worksheet.Cell(1, 12).Value = "package Without Invoice";
            worksheet.Cell(1, 13).Value = "Non-Use Account Charge";
            worksheet.Cell(1, 14).Value = "Total";

            // Apply formatting
            var headerRange = worksheet.Range("A1:N1");
            headerRange.Style.Font.Bold = true;

            headerRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
        }

        private void AddDetalleSheetData(IXLWorksheet worksheet, List<Manifestdetail> data)
        {
            int row = 2;
            foreach (var item in data)
            {
                worksheet.Cell(row, 1).Value = item.FullName;
                worksheet.Cell(row, 2).Value = item.ManifestNumber;
                worksheet.Cell(row, 3).Value = item.InvoiceNumber;
                worksheet.Cell(row, 4).Value = item.Date;
                worksheet.Cell(row, 5).Value = item.FREIGHT_VOLUMEN;
                worksheet.Cell(row, 6).Value = item.FREIGHTFLETE_INTERNACIONAL;
                worksheet.Cell(row, 7).Value = item.HANDLING;
                worksheet.Cell(row, 8).Value = item.IMPUESTOS_DE_ADUANA;
                worksheet.Cell(row, 9).Value = item.IVA;
                worksheet.Cell(row, 10).Value = item.MANEJO_CR;
                worksheet.Cell(row, 11).Value = item.PACKAGE_REVISION_PREVIO_EXAMEN;
                worksheet.Cell(row, 12).Value = item.PAQUETE_SIN_FACTURA;
                worksheet.Cell(row, 13).Value = item.RECARGO_NO_USO_DE_CUENTA;
                worksheet.Cell(row, 14).Value = item.Total;
                row++;
            }
        }

        #endregion

        #endregion
    }
}