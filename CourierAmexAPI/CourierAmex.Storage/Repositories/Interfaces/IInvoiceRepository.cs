using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories.Interfaces
{
    public interface IInvoiceRepository
    {
        Task<(IEnumerable<Invoice> invoices, int totalRows)> GetDocumentByCustomerAsync(string clientId, string fromDate, string toDate, string filters, int? pageNumber = null, int? pageSize = null);
        Task<IEnumerable<Invoice>> InvoicesPendingByCustomer(string clientId);
        Task<IEnumerable<InvoiceDetails>> GetPackagesByInvoice(int invoiceNumber);
        Task<FullInvoiceResult> GetInvoiceInfoByIdAsync(int invoiceId);
        Task<FullInvoiceResult> GetPaymentInfoByIdAsync(int paymentId, int invoiceNumber);
        Task<IEnumerable<Invoice>> GetInvoiceInfoDetailByIdAsync(int invoiceId);
        Task<PaymentInfo> GetPaymentDetailsAsync(int companyId, int paymentId);
        Task<List<PaymentInfo>> GetPaymentDetailsForLableAsync(int companyId, int paymentId);
        Task<IEnumerable<PendingInvoiceReport>> GetPendingInvoicesReportAsync(int companyId, DateTime startDate, DateTime endDate, int paymentType, int zoneId);
        Task<List<PaymentInfo>> GetPaymentInfoByInvoiceIdAsync(int companyId, int InvoiceNumber);
        Task<int> InsertCreditNoteAsync(CreditNoteInsertRequest request);
        Task<int> CancelInvoiceAsync(int companyId, int invoiceId, string userId);
        Task<IEnumerable<SalesReport>> GetSalesReportAsync(int companyId, DateTime startDate, DateTime endDate, string customerCode);
        Task<bool> IsElectronicInvoiceProcessedAsync(int companyId, int invoiceId);
        Task<int> InsertCustomsTaxLoadAsync(List<CustomsTaxLoad> taxLoadList);
        Task<int?> GetCustomsTaxByPackageNumberAsync(string packageNumber);
        Task<int?> GetCustomsTaxByBagAsync(string bag);
        Task<IEnumerable<AeropostMassUploadReport>> GetAeropostMassUploadReportAsync(int companyId, DateTime startDate, DateTime endDate, int providerId);
        Task<string> GenerateAccountingEntryAsync(int companyId, string periodDate, string entryDate, string entryDescription, string statusIndicator, string sourceSystemCode, string systemIndicator, string inclusionDate, int inclusionUser);
        Task<int> GenerateAccountingEntryInvoiceAsync(int companyId, string entryCode, int invoiceNumber);
        Task<IEnumerable<TemplateAccount>> SelectTemplateAccountAsync(int companyId, string moduleCode, int templateCode);
        Task<int> InsertAccountingDetailAsync(AccountingDetail accountingDetail);
        Task<IEnumerable<int>> ValidateAccountingEntryAsync(int companyId, string entryCode);
        Task<IEnumerable<int>> ApplyAccountingEntryAsync(int companyId, string entryCode);
        Task<IEnumerable<CustomsTaxesReportModel>> GetCustomsTaxesReportAsync(string customerCode, DateTime fromDate, DateTime toDate, string manifestNumber, string bag);
    }
}