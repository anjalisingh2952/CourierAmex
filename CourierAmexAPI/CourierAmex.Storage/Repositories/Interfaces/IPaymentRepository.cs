using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories.Interfaces
{
    public interface IPaymentRepository
    {
        Task<IEnumerable<SignaturePackageResponse>> GetSignaturePackageAsync(int packageNumber);
        Task<IEnumerable<PointOfSale>> GetPointOfSaleAsync(int companyId, string user, int state);
        Task<int> StartPointOfSaleAsync(int companyId, string user, int pointOfSaleId, int inDollars, int inLocal);
        Task<IEnumerable<SubPaymentType>> GetSubPaymentTypeByPaymentIdAsync(int CompanyId, int PaymentId, int PointOfSaleId);
        Task<IEnumerable<PayType>> GetPaymentTypeAsync(int CompanyId);
        Task<IEnumerable<PointOfSaleDailySummary>> GetPointOfSaleDailySummaryAsync(int CompanyId, int OpeningCode);
        Task<int> CashInOutAsync(int companyId, string user, int pointOfSaleId, int inDollars, int inLocal, int openingId);
        Task<int> ClosePointOfSaleAsync(int OpeningId);
        Task<int> CancelPaymentAsync(int CompanyId, int PaymentId, string UserId);
        Task<IEnumerable<PointOfSaleDetail>> GetPointOfDetailByOpeningCodeAsync(int CompanyId, int? OpeningCode, int? pointOfSaleId, DateTime? ChooseDate);
        Task<int> PaymentForInvoicesAsync(
        int customerId, string invoiceCSV, double localAmount, double dollarAmount, double paidAmount, double changeAmount, int currencyCode,
        string paymentType, int subPaymentTypeId, string reference, int pointOfSaleId, int companyId, bool partialPayment, bool creditPayment, string user);
    }
}
