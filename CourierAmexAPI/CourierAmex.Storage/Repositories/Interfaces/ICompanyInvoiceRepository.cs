using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface ICompanyInvoiceRepository
    {
        Task<IEnumerable<Manifest>> GetManifestAsync(int companyid);
        Task<CompanyInvoiceData> GetInvoiceDataByCustomerAsync(string clientid, string packagenumber);
        Task<CompanyInvoiceData> GetInvoiceDataByManifestAsync(int manifestid, string packagenumber);
        Task<int> VerifyPackageNumberAndManifestIdAsync(int manifestid, string packagenumber);
        Task<int?> CreateInvoiceHeader(ComapnyInvoiceHeader entity);
        Task<int?> CreateInvoiceDetail(CompanyInvoiceDetail entity);
        Task<int?> GetNewInvoiceNumber();
        Task<IEnumerable<InvoiceCreditPending>> Get_Report_OutstandingCreditCustomerInvoices(int companyid, DateTime startDate, DateTime endDate, string zoneIds);
        Task<IEnumerable<InvoiceArticle>> GetInvoiceArticlesJamaicaAsync(string zone, float weight, float value, float volume, int shippingType, int package);
        Task<IEnumerable<InvoiceArticle>> GetInvoiceArticlesAsync(string customer, int type, float weight, float volume, int shippingType, string packages, Boolean transportation = true, Boolean delivery = true);
        Task<int?> UpdateInvoiceStatus(string packagenumbers);
        Task<ElectronicInvoice?> GetElectronicInvoiceInformationAsync(string customerCode);
        Task<int?> SaveElectronicInvoiceInformationAsync(InsertElectronicInvoice entity);
        Task<int?> SaveMiamiInvoiceAsync(InsertMiamiInvoice entity);
        Task<int?> ManifestInvoiceAsync(ManifestInvoice entity);
        Task<CompanyExchangeRate> GetCompanyExchangeRateAsync(int CompanyId, int InvoiceNumber);
        Task<IEnumerable<SalesSummaryReport>> GetSalesSummaryAsync(string startDate, string endDate, string customerCode);
    }
}
