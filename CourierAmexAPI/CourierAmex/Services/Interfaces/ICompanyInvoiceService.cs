using CourierAmex.Models;
using CourierAmex.Storage.Domain;
using Microsoft.AspNetCore.Mvc;

namespace CourierAmex.Services
{
    public interface ICompanyInvoiceService
    {
        Task<GenericResponse<List<ManifestModel>>> GetManifestAsync(int companyid);
        Task<GenericResponse<CompanyInvoiceData>> GetInvoiceDataByCustomerAsync(string clientid, string packagenumber);
        Task<GenericResponse<CompanyInvoiceData>> GetInvoiceDataByManifestAsync(int manifestid, string packagenumber);
        Task<GenericResponse<int>> VerifyPackageNumberAndManifestIdAsync(int manifestid, string packagenumber);
        Task<GenericResponse<int?>> CreateInvoiceHeaderAsync(ComapnyInvoiceHeader entity);
        Task<GenericResponse<int?>> CreateInvoiceDetailAsync(CompanyInvoiceDetail entity);
        Task<GenericResponse<int?>> GetNewInvoiceNumberAsync();
        Task<GenericResponse<List<InvoiceCreditPending>>> Get_OutstandingCreditCustomerInvoicesAsync(int companyid, DateTime startDate, DateTime endDate, string zoneIds);
        Task<GenericResponse<List<InvoiceArticle>>> GetInvoiceArticlesJamaicaAsync(string zone, float weight, float Value, float volume, int shippingType, int package);
        Task<GenericResponse<List<InvoiceArticle>>> GetInvoiceArticlesAsync(string customer, int type, float weight, float volume, int shippingType, string packages);
        Task<GenericResponse<int?>> UpdateInvoiceStatus(string packagenumbers);
        Task<GenericResponse<ElectronicInvoice>> GetElectronicInvoiceInformationAsync(string customerCode);
        Task<GenericResponse<int?>> SaveElectronicInvoiceInformationAsync(InsertElectronicInvoice entity);
        Task<GenericResponse<int?>> SaveMiamiInvoiceAsync(InsertMiamiInvoice entity);
        Task<GenericResponse<int?>> ManifestInvoiceAsync(ManifestInvoice entity);
        Task<GenericResponse<CompanyExchangeRate>> GetCompanyExchangeRateAsync(int CompanyId, int InvoiceNumber);
        Task<GenericResponse<List<SalesSummaryReport>>> GetSalesSummaryAsync(string startDate, string endDate, string customerCode);
    }
}
