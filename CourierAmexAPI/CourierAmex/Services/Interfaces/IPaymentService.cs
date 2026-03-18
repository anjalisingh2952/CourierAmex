using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services.Interfaces
{
    public interface IPaymentService
    {
        Task<SignaturePackageResponseModel> GetSignaturePackage(int packageNumber);
        Task ProcessEmail(IServiceScope scope, string baseTemplate, EmailQueue email);
        Task<List<PointOfSaleModel>> GetPointOfSale(int companyId, string user, int state);
        Task<int> StartPointOfSale(int companyId, string user, int pointOfSaleId, int inDollars, int inLocal);
        Task<List<SubPaymentTypeModel>> GetSubPaymentTypeByPaymentId(int CompanyId, int PaymentId, int PointOfSaleId);
        Task<List<PayTypeModel>> GetPaymentType(int CompanyId);
        Task<int> ClosePointOfSale(int OpeningId);
        Task<int> CancelPayment(int companyId, int paymentId, string userId);
        Task<List<PointOfSaleDailySummaryModel>> GetPointOfSaleDailySummary(int CompanyId, int OpeningCode);
        Task<List<PointOfSaleDetailModel>> GetPointOfDetailByOpeningCode(int CompanyId, int? OpeningCode, int? pointOfSaleId, DateTime? ChooseDate);
        Task<Byte[]> GetPointOfSaleDailyExcelReport(int companyId, int? openingCode, int? pointOfSaleId, DateTime? chooseDate);
        Task<int> CashInOut(int companyId, string user, int pointOfSaleId, int inDollars, int inLocal, int openingId);
        Task<int> PaymentForInvoices(int customerId, string invoiceCSV, double localAmount, double dollarAmount, double paidAmount, double changeAmount, int currencyCode,
        string paymentType, int subPaymentTypeId, string reference, int pointOfSaleId, int companyId, bool partialPayment, bool creditPayment, string user)
;
    }
}
