using CourierAmex.Models;
using Microsoft.AspNetCore.Mvc;

namespace CourierAmex.Services.Interfaces
{
    public interface IInvoiceGenerateService
    {
        Task<FileContentResult> GeneratePdfFromHtmlAsync(string htmlContent);
        Task<string> GetImageBase64StringAsync(string imagePath);
        Task<string> PrepareInvoiceHtmlAsync(dynamic invoiceData);
        Task<string> PrepareDeliveryProofHtmlAsync(SignaturePackageResponseModel signature);
        Task<string> CreateRoadMapReportHtmlAsync(List<RoadMapstReportModel> roadMapData, dynamic? reportData);
        Task<string> CreateParcelDeliveryReportHtmlAsync(List<ParcelDeliveryReportModel> parcelDeliveryReportData, dynamic reportData);

    }

}
