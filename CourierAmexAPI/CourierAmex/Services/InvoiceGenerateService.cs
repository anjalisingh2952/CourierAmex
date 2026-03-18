using AutoMapper;
using CourierAmex.Storage;
using CourierAmex.Storage.Enums;
using CourierAmex.Storage.Repositories;
using CourierAmex.Models;
using Entities = CourierAmex.Storage.Domain;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Mvc;
using SelectPdf;
using System.Drawing;
using System.Net.NetworkInformation;
using ZXing;
using ZXing.Common;
using QRCoder;
using ZXing.QrCode.Internal;
using System.Drawing.Imaging;
using SkiaSharp;
using ZXing.SkiaSharp.Rendering;
using System.Text;

namespace CourierAmex.Services
{
    public class InvoiceGenerateService : IInvoiceGenerateService
    {
        public async Task<string> PrepareInvoiceHtmlAsync(dynamic invoiceData)
        {
            FullInvoiceResult invoiceInfo = invoiceData?.InvoiceInfo;
            IEnumerable<InvoiceModel> invoiceDetails = invoiceData?.InvoiceDetails ?? new List<InvoiceModel>();

            var service = invoiceDetails.Where(i => i?.ProductType == "Services").ToList();
            var customCharge = invoiceDetails.Where(i => i?.ProductType == "CustomsTax").ToList();
            var otherCharge = invoiceDetails.Where(i => i?.ProductType == "OtherCharges").ToList();

            var PackageDetails = invoiceInfo?.Packages ?? new List<Package>();
            var InvoiceDetails = invoiceInfo?.Invoice ?? new Invoice();
            var CompanyDetail = invoiceInfo?.Company;

            string Billing = !string.IsNullOrEmpty(InvoiceDetails?.Key) && InvoiceDetails.Key.Length >= 41
                ? InvoiceDetails.Key.Substring(21, 20)
                : "Null";

            var qrCode = GenerateQrCode(InvoiceDetails?.InvoiceNumber ?? "0", 300, 300);
            var barcode = GenerateBarcode(InvoiceDetails?.InvoiceNumber ?? "0", 700, 700);
            string frameBase64 = Convert.ToBase64String(qrCode);
            string barcodeBase64 = Convert.ToBase64String(barcode);
            string logoBase64 = await GetImageBase64StringAsync(@"./AmericanExport.png");

            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "Invoice.html");
            var htmlContent = await File.ReadAllTextAsync(filePath);
            var sb = new StringBuilder(htmlContent);

            void ReplacePlaceholder(string placeholder, string value) =>
                sb.Replace(placeholder, string.IsNullOrWhiteSpace(value) ? "Null" : value);

            ReplacePlaceholder("{{invoiceNumber}}", InvoiceDetails?.InvoiceNumber);
            ReplacePlaceholder("{{logoBase64}}", logoBase64);
            ReplacePlaceholder("{{frameBase64}}", frameBase64);
            ReplacePlaceholder("{{barcodeBase64}}", barcodeBase64);
            ReplacePlaceholder("{{SubTotal}}", InvoiceDetails?.Subtotal.ToString("N2"));
            ReplacePlaceholder("{{I.V.A:}}", "1");
            ReplacePlaceholder("{{OtrosCargos}}", InvoiceDetails?.TaxableAmount.ToString("N2"));
            ReplacePlaceholder("{{CustomsTaxes}}", InvoiceDetails?.CustomsTax.ToString());
            ReplacePlaceholder("{{Total$:}}", InvoiceDetails?.Total.ToString("N2"));
            ReplacePlaceholder("{{Total:}}", InvoiceDetails?.TotalLocal.ToString("N2"));
            ReplacePlaceholder("{{Client}}", InvoiceDetails?.Client);
            ReplacePlaceholder("{{FullName}}", InvoiceDetails?.FullName);
            ReplacePlaceholder("{{Key}}", InvoiceDetails?.Key);
            ReplacePlaceholder("{{Billing}}", Billing);
            ReplacePlaceholder("{{Address}}", CompanyDetail?.Address);
            ReplacePlaceholder("{{Email}}", CompanyDetail?.Email);
            ReplacePlaceholder("{{Tel}}", CompanyDetail?.Phone?.ToString());
            ReplacePlaceholder("{{ExchangeRateSale}}", InvoiceDetails?.ExchangeRateSale.ToString("N2"));
            ReplacePlaceholder("{{InvoiceDate}}", InvoiceDetails?.Date.ToString("MM/dd/yyyy hh:mm:ss tt"));

            // Package Details
            var packageContent = new StringBuilder();
            if (PackageDetails.Any())
            {
                var head = "<p class=\"text-center\"><b>DETAILS OF PACKAGES ON INVOICE</b></p>";
                       

                foreach (var Package in PackageDetails)
                {
                    packageContent.Append($@"
            <div class=""detailsde_2"">
                <div class=""detailsde-box"">{Package?.Number}</div>
                <div class=""detailsde-box"">{Package?.Weight}</div>
                <div class=""detailsde-box"">{Package?.VolumetricWeight}</div>
                <div class=""detailsde-box"">{Package?.Origin}</div>
            </div>");
                }
                ReplacePlaceholder("{{PackageDetails}}", packageContent.ToString());
                ReplacePlaceholder("{{PackageDetailsHead}}", head);
            }
            else
            {
                ReplacePlaceholder("{{PackageDetails}}", "");
                ReplacePlaceholder("{{PackageDetailsHead}}", "");
            }

            // Service Details
            var serviceContent = new StringBuilder();
            if (service.Any())
            {
                var head = "<p class=\"text-center\"><b>SERVICES</b></p>";

                foreach (var item in service)
                {
                    serviceContent.Append($@"
            <div class=""detailsde_2-boxs"">
                <div class=""detailsde-box"">{item?.Description}</div>
                <div class=""detailsde-box"">{item?.Quantity}</div>
                <div class=""detailsde-box"">{item?.Price:N2}</div>
                <div class=""detailsde-box"">{item?.Total:N2}</div>
            </div>");
                }
                ReplacePlaceholder("{{Services}}", serviceContent.ToString());
                ReplacePlaceholder("{{ServiceHead}}", head);
            }
            else
            {
                ReplacePlaceholder("{{Services}}", "");
                ReplacePlaceholder("{{ServiceHead}}", "");
            }

            // Customs Charges
            var customChargeContent = new StringBuilder();
            if (customCharge.Any())
            {
                var head = "<p class=\"text-center\"><b>CUSTOMS TAXES</b></p>";

                foreach (var item in customCharge)
                {
                    customChargeContent.Append($@"
            <div class=""detailsde_2-boxs"">
                <div class=""detailsde-box"">{item?.Description}</div>
                <div class=""detailsde-box"">{item?.Quantity}</div>
                <div class=""detailsde-box"">{item?.Price:N2}</div>
                <div class=""detailsde-box"">{item?.Total:N2}</div>
            </div>");
                }
                ReplacePlaceholder("{{CustomCharges}}", customChargeContent.ToString());
                ReplacePlaceholder("{{CustomChargesHead}}", head);
            }
            else
            {
                ReplacePlaceholder("{{CustomCharges}}", "");
                ReplacePlaceholder("{{CustomChargesHead}}", "");
            }

            // Other Charges
            var otherChargeContent = new StringBuilder();
            if (otherCharge.Any())
            {
                var head = "<p class=\"text-center\"><b>OTHER CHARGES</b></p>";

                foreach (var item in otherCharge)
                {
                    otherChargeContent.Append($@"
            <div class=""detailsde_2-boxs"">
                <div class=""detailsde-box"">{item?.Description}</div>
                <div class=""detailsde-box"">{item?.Quantity}</div>
                <div class=""detailsde-box"">{item?.Price:N2}</div>
                <div class=""detailsde-box"">{item?.Total:N2}</div>
            </div>");
                }
                ReplacePlaceholder("{{OtherCharges}}", otherChargeContent.ToString());
                ReplacePlaceholder("{{OtherChargesHead}}", head);
            }
            else
            {
                ReplacePlaceholder("{{OtherCharges}}", "");
                ReplacePlaceholder("{{OtherChargesHead}}", "");
            }

            return sb.ToString();
        }

        public async Task<string> PrepareDeliveryProofHtmlAsync(SignaturePackageResponseModel signature)
        {
            string logoBase64 = await GetImageBase64StringAsync(@"./AmericanExport.png");

            string signatureBase64 = Convert.ToBase64String(signature.Signature);
            string packageImageBase64 = Convert.ToBase64String(signature.PackageImage);
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "DeliveryProof.html");
            var htmlContent = await File.ReadAllTextAsync(filePath);

            htmlContent = htmlContent.Replace("{{logoBase64}}", logoBase64 ?? "Null");
            htmlContent = htmlContent.Replace("{{signatureBase64}}", signatureBase64 ?? "Null");
            htmlContent = htmlContent.Replace("{{packageImageBase64}}", packageImageBase64 ?? "Null");
            htmlContent = htmlContent.Replace("{{DeliveryDate}}", signature?.LastModifiedDate.ToString("MM/dd/yyyy hh:mm:ss tt") ?? "Null");
            htmlContent = htmlContent.Replace("{{Account}}", signature?.PackageNumber.ToString() ?? "Null");
            htmlContent = htmlContent.Replace("{{Description}}", string.IsNullOrEmpty(signature?.Description) ? "Null" : signature.Description);
            htmlContent = htmlContent.Replace("{{DeliveredTo}}", string.IsNullOrEmpty(signature?.Name) ? "Null" : signature.Name);
            htmlContent = htmlContent.Replace("{{Customer}}", string.IsNullOrEmpty(signature?.Customer) ? "Null" : signature.Customer);
            htmlContent = htmlContent.Replace("{{DocumentDate}}", DateTime.Now.ToString("MM/dd/yyyy"));

            return htmlContent;
        }

        public async Task<string> CreateRoadMapReportHtmlAsync(List<RoadMapstReportModel> roadMapData, dynamic reportData)
        {
            if (roadMapData == null || roadMapData.Count == 0)
                return string.Empty;

            // Generate QR and Barcode images
            var qrCode = GenerateQrCode(roadMapData[0].RouteSheetId.ToString(), 300, 300);
            var barcode = GenerateBarcode(roadMapData[0].RouteSheetId.ToString(), 700, 700);
            string qrCodeBase64 = Convert.ToBase64String(qrCode);
            string barcodeBase64 = Convert.ToBase64String(barcode);
            string logoBase64 = await GetImageBase64StringAsync(@"./AmericanExport.png");

            // Load the HTML template
            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "RoadMapReportTemplate.html");
            var htmlContent = await File.ReadAllTextAsync(filePath);
            var sb = new StringBuilder(htmlContent);

            // Replace general placeholders
            void ReplacePlaceholder(string placeholder, string value) => sb.Replace(placeholder, value ?? "N/A");

            ReplacePlaceholder("{{reportDate}}", DateTime.Now.ToShortDateString());

            ReplacePlaceholder("{{RouteSheetName}}", roadMapData[0].RouteSheetName);
            ReplacePlaceholder("{{TotalPackages}}", roadMapData.Sum(x => x.Pieces).ToString());
            ReplacePlaceholder("{{Zone}}", roadMapData[0].Zone);
            ReplacePlaceholder("{{Stop}}", roadMapData[0].StopName);
            ReplacePlaceholder("{{QRCode}}", $"data:image/png;base64,{qrCodeBase64}");
            ReplacePlaceholder("{{totalPackage}}", roadMapData.Count.ToString());
            ReplacePlaceholder("{{Barcode}}", $"data:image/png;base64,{barcodeBase64}");
            ReplacePlaceholder("{{CompanyLogo}}", $"data:image/png;base64,{logoBase64}");
            ReplacePlaceholder("{{printDate}}", DateTime.Now.ToString("yyyy-MM-dd"));
            ReplacePlaceholder("{{printTime}}", DateTime.Now.ToString("HH:mm:ss"));

            // Generate customer-wise data
            var groupedData = roadMapData.GroupBy(x => x.ClientName);
            var customerContent = new StringBuilder();

            foreach (var group in groupedData)
            {
                customerContent.Append($@"
                <div class='section-title'>CUSTOMER: {group.Key}</div>
                <table>
                    <thead>
                        <tr>
                            <th>TRACKING</th>
                            <th>PCS</th>
                            <th>ORIGIN</th>
                            <th>COURIER</th>
                            <th>INVOICE</th>
                            <th>DESCRIPTION</th>
                            <th>KILOS</th>
                        </tr>
                    </thead>
                <tbody>");

                foreach (var item in group)
                {
                    customerContent.Append($@"
                <tr>
                    <td>{item.PackageNumber}</td>
                    <td>{item.Pieces}</td>
                    <td>{item.Origin}</td>
                    <td>{item.Courier}</td>
                    <td>{item.InvoiceNumber}</td>
                    <td>{item.Description}</td>
                    <td>{item.Weight}</td>
                </tr>");
                }

                customerContent.Append("</tbody></table>");
            }

            ReplacePlaceholder("{{CustomerDetails}}", customerContent.ToString());

            return sb.ToString();
        }

        public async Task<string> CreateParcelDeliveryReportHtmlAsync(List<ParcelDeliveryReportModel> parcelDeliveryReportData, dynamic reportData)
        {
            if (parcelDeliveryReportData == null || parcelDeliveryReportData.Count == 0)
                return string.Empty;

            string logoBase64 = await GetImageBase64StringAsync(@"./AmericanExport.png");

            string filePath = Path.Combine(Directory.GetCurrentDirectory(), "Templates", "RouteSheetReportTransportationCompany.html");
            var htmlContent = await File.ReadAllTextAsync(filePath);
            var sb = new StringBuilder(htmlContent);

            void ReplacePlaceholder(string placeholder, string value) => sb.Replace(placeholder, value ?? "N/A");

            ReplacePlaceholder("{{CompanyLogo}}", $"data:image/png;base64,{logoBase64}");
            ReplacePlaceholder("{{printTime}}", DateTime.Now.ToString("HH:mm:ss"));
            ReplacePlaceholder("{{printDate}}", DateTime.Now.ToString("yyyy-MM-dd"));

            var customerContent = new StringBuilder();

            customerContent.Append($@"
            <tr>
                <th>FULL NAME</th>
                <th>INVOICE</th>
                <th>AMOUNT</th>
            </tr>");

            decimal totalAmount = 0;

            foreach (var item in parcelDeliveryReportData)
            {
                customerContent.Append($@"
                <tr>
                    <td>{item.FullName}</td>
                    <td>{item.InvoiceNumber}</td>
                    <td>${item.Amount:F2}</td>
                </tr>");

                totalAmount += item.Amount;
            }

            customerContent.Append($@"
            <tr>
                <td class='total' colspan='2'>TOTAL AMOUNT</td>
                <td><strong>${totalAmount:F2}</strong></td>
            </tr>");

            ReplacePlaceholder("{{CustomerDetails}}", customerContent.ToString());

            return sb.ToString();
        }

        public async Task<string> GetImageBase64StringAsync(string imagePath)
        {
            byte[] imageBytes = await System.IO.File.ReadAllBytesAsync(imagePath);
            return Convert.ToBase64String(imageBytes);
        }


            public byte[] GenerateQrCode(string text, int width, int height)
            {
                var barcodeWriter = new BarcodeWriter<SKBitmap>
                {
                    Format = BarcodeFormat.QR_CODE,
                    Options = new ZXing.Common.EncodingOptions
                    {
                        Width = width,
                        Height = height,
                        Margin = 0
                    },
                    Renderer = new SKBitmapRenderer()
                };

                using var bitmap = barcodeWriter.Write(text);
                using var image = SKImage.FromBitmap(bitmap);
                using var data = image.Encode(SKEncodedImageFormat.Png, 100);
                return data.ToArray();
            }
            public byte[] GenerateBarcode(string text, int width, int height)
            {
                var barcodeWriter = new BarcodeWriter<SKBitmap>
                {
                    Format = BarcodeFormat.CODE_128,
                    Options = new ZXing.Common.EncodingOptions
                    {
                        Width = width,
                        Height = height,
                        Margin = 0
                    },
                    Renderer = new SKBitmapRenderer()
                };

                using var bitmap = barcodeWriter.Write(text);
                using var image = SKImage.FromBitmap(bitmap);
                using var data = image.Encode(SKEncodedImageFormat.Png, 100);
                return data.ToArray();
            }
        
        public async Task<FileContentResult> GeneratePdfFromHtmlAsync(string htmlContent)
        {
            HtmlToPdf converter = new HtmlToPdf
            {
                Options =
                    {
                        PdfPageSize = PdfPageSize.A4,
                        PdfPageOrientation = PdfPageOrientation.Portrait
                    }
            };

            return await Task.Run(() =>
            {
                PdfDocument document = converter.ConvertHtmlString(htmlContent);
                using (var memoryStream = new MemoryStream())
                {
                    document.Save(memoryStream);
                    document.Close();
                    memoryStream.Position = 0;
                    return new FileContentResult(memoryStream.ToArray(), "application/pdf")
                    {
                        FileDownloadName = "GeneratedDocument.pdf"
                    };
                }
            });
        }
    }
}
