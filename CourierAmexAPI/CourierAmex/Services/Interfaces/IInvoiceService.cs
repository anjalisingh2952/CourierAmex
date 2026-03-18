using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services.Interfaces
{
    public interface IInvoiceService
    {
        Task<GenericResponse<(IEnumerable<Invoice> invoices, int totalRows)>> GetDocumentByCustomerAsync(string clientId, string fromDate, string toDate, string filters, int? pageNumber = null, int? pageSize = null);        Task<GenericResponse<IEnumerable<InvoiceModel>>> InvoicesPendingByCustomer(string clientId);
        Task<GenericResponse<IEnumerable<InvoiceDetailsModel>>> GetPackagesByInvoice(int invoiceNumber);
        Task<FullInvoiceResult> GetInvoiceInfoByIdAsync(int invoiceId);
        Task<FullInvoiceResult> GetPaymentInfoById(int paymentId, int invoiceNumber);
        Task<GenericResponse<IEnumerable<InvoiceModel>>> GetInvoiceInfoDetailByIdAsync(int invoiceId);
        Task<GenericResponse<PaymentInfoModel>> GetPaymentDetails(int companyId, int paymentId);
        Task<List<PaymentInfoModel>> GetPaymentDetailsForLable(int companyId, int paymentId);

        Task<GenericResponse<List<PendingInvoiceReportModel>>> GetPendingInvoicesReportAsync(int companyId, DateTime startDate, DateTime endDate, int paymentType, int zoneId);
        Task<List<PaymentInfoModel>> GetPaymentInfoByInvoiceId(int companyId, int InvoiceNumber);
        Task<GenericResponse<Boolean>> IsElectronicInvoiceProcessed(int companyId, int invoiceNumber);
        Task<GenericResponse<int>> InsertCreditNote(CreditNoteInsertRequestModel request);
        Task<GenericResponse<int>> CancelInvoice(int companyId, int invoiceId, string userId);
        Task<GenericResponse<List<SalesReportModel>>> GetSalesReportAsync(int companyId, DateTime startDate, DateTime endDate, string customerCode);
        Task<GenericResponse<bool>> InsertCustomsTaxLoadAsync(List<CustomsTaxLoad> taxLoadList);

        Task<GenericResponse<int?>> GetCustomsTaxByPackageNumberAsync(string packageNumber);

        Task<GenericResponse<int?>> GetCustomsTaxByBagAsync(string bag);

        Task<GenericResponse<List<AeropostMassUploadReport>>> GetAeropostMassUploadReportAsync(int companyId, DateTime startDate, DateTime endDate, int providerId);
        Task<GenericResponse<string>> GenerateAccountingEntry(int companyId, string periodDate, string entryDate, string entryDescription, string statusIndicator, string sourceSystemCode, string systemIndicator, string inclusionDate, int inclusionUser);
        Task<GenericResponse<int>> GenerateAccountingEntryInvoice(int companyId, string entryCode, int invoiceNumber);
        Task<GenericResponse<IEnumerable<TemplateAccountModel>>> SelectTemplateAccount(int companyId, string moduleCode, int templateCode);
        Task<GenericResponse<int>> InsertAccountingDetail(AccountingDetail accountingDetail);
        Task<GenericResponse<int>> ValidateAccountingEntry(int companyId, string entryCode);
        Task<GenericResponse<int>> ApplyAccountingEntry(int companyId, string entryCode);
        Task<GenericResponse<List<CustomsTaxesReportModel>>> GetCustomsTaxesReportAsync(
         string customerCode, DateTime fromDate, DateTime toDate, string? manifestNumber, string? bag);



    }
}
