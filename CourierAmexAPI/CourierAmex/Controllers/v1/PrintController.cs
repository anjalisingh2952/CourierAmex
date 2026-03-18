using Microsoft.AspNetCore.Http.Features;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Neodynamic.SDK.Printing;
using CourierAmex.Models;
using CourierAmex.Services;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage;
using CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Authorization;
using Neodynamic.SDK.Printing;
using Microsoft.AspNetCore.Mvc;
using DocumentFormat.OpenXml.Vml;
using System.Globalization;
namespace CourierAmex.Controllers.v1
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class PrintController : ControllerBase
    {
        private readonly IPrintService _service;
        private readonly IManifestService _manifestService;
        private IWebHostEnvironment _env;
        private HttpContext _ctx;

        public PrintController(IWebHostEnvironment env, IHttpContextAccessor ctx, IPrintService service, IManifestService manifestService)
        {
            _env = env;
            _ctx = ctx.HttpContext;
            var syncIOFeature = _ctx.Features.Get<IHttpBodyControlFeature>();
            if (syncIOFeature != null)
            {
                syncIOFeature.AllowSynchronousIO = true;
            }
            _manifestService = manifestService;
            _service = service;
        }

        [HttpGet("GetWebPrintJob")]
        [AllowAnonymous]
        public async Task GetWebPrintJob([FromQuery] int PackageNumber , [FromQuery] int companyId, [FromQuery] string labelDimensions, [FromQuery] string docType)
        {
            try
            {
                WebPrintJob webPj = new WebPrintJob();

                PackageManifestInfoModel labelData = await _manifestService.GetPackageManifestInfo(companyId, PackageNumber);

                if (labelDimensions == "4x6" && docType == "General")
                {
                    webPj.ThermalLabel = _service.GeneratePackageLabel_4_6(labelData.CustomerAccount, labelData.CustomerName, labelData.TaxType, labelData.IdentificationNumber, labelData.ManifestCountry, labelData.CityName, labelData.Address1, labelData.Address2, labelData.Zone, labelData.Area, labelData.CustomerCompanyName, labelData.PackageNumber.ToString(), labelData.PackageDescription, labelData.TotalLabel, (double)labelData.Weight, (labelData.Height * labelData.Weight * labelData.Width).ToString(), (double)labelData.VolumetricWeight);
                }

                if (labelDimensions == "4x3" && docType == "General")
                {
                    webPj.ThermalLabel = _service.GenerateAmexThermalLabel_4_3(labelData.CustomerAccount, labelData.CustomerName, labelData.CountryName, labelData.Zone, labelData.Area, labelData.PackageID.ToString(), labelData.ManifestNumber, labelData.PackageDescription, labelData.TotalLabel, (double)labelData.Weight, (labelData.Height * labelData.Weight * labelData.Width).ToString(), "", labelData.PackageStatusID.ToString());
                }

                PrinterSettings printerSettings = new PrinterSettings();
                printerSettings.PrinterName = "Zebra GX420d";
                printerSettings.Dpi = 203;
                printerSettings.ProgrammingLanguage = ProgrammingLanguage.ZPL;

                webPj.PrinterSettings = printerSettings;
                webPj.ShowPrintDialog = false;

                _ctx.Response.ContentType = "text/plain";
                await _ctx.Response.Body.WriteAsync(Encoding.UTF8.GetBytes(webPj.ToString()));
            }
            catch (Exception ex)
            {
                _ctx.Response.StatusCode = 400;
                _ctx.Response.ContentType = "text/plain";
                await _ctx.Response.Body.WriteAsync(Encoding.UTF8.GetBytes(ex.Message));
            }
        }

        [HttpGet("GenerateAmexThermalLabel")]
        [AllowAnonymous]
        public async Task GenerateAmexThermalLabel([FromQuery] int PackageNumber)
        {
            try
            {
                WebPrintJob webPj = new WebPrintJob();

                PackageManifestInfoModel labelData = await _manifestService.GetPackageManifestInfo(2, PackageNumber);

                webPj.ThermalLabel = _service.GenerateAmexThermalLabel_4_3(labelData.CustomerAccount, labelData.CustomerName,labelData.CountryName, labelData.Zone, labelData.Area,labelData.PackageID.ToString(), labelData.ManifestNumber, labelData.PackageDescription, labelData.TotalLabel, (double)labelData.Weight, (labelData.Height * labelData.Weight * labelData.Width).ToString(),"",labelData.PackageStatusID.ToString());

                PrinterSettings printerSettings = new PrinterSettings();
                printerSettings.PrinterName = "Zebra GX420d";
                printerSettings.Dpi = 203;
                printerSettings.ProgrammingLanguage = ProgrammingLanguage.ZPL;

                webPj.PrinterSettings = printerSettings;
                webPj.ShowPrintDialog = false;

                _ctx.Response.ContentType = "text/plain";
                await _ctx.Response.Body.WriteAsync(Encoding.UTF8.GetBytes(webPj.ToString()));
            }
            catch (Exception ex)
            {
                _ctx.Response.StatusCode = 400;
                _ctx.Response.ContentType = "text/plain";
                await _ctx.Response.Body.WriteAsync(Encoding.UTF8.GetBytes(ex.Message));
            }
        }

        [HttpGet("download-label")]
        [AllowAnonymous]
        public IActionResult DownloadThermalLabel()
        {
            try
            {
                ThermalLabel label = _service.GenerateBasicThermalLabel();
                PrintJob pj = new PrintJob();
                ImageSettings imgSettings = new ImageSettings
                {
                    ImageFormat = ImageFormat.Png              
                };
                using (MemoryStream ms = new MemoryStream())
                {
                    pj.ExportToImage(label, ms, imgSettings, 300);
                    byte[] imageBytes = ms.ToArray();
                    return File(imageBytes, "image/png", "thermal_label.png");
                }
            }
            catch (Exception ex)
            {
                return BadRequest($"Error generating label: {ex.Message}");
            }
        }

        public class PrintRequestModel
        {
            public string Text { get; set; }
        }
    }
}