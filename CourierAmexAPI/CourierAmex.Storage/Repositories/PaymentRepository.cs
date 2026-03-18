using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Repositories.Interfaces;
using Dapper;

namespace CourierAmex.Storage.Repositories
{
    public class PaymentRepository : IPaymentRepository
    {
        private readonly IDalSession _session;
        public PaymentRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<SignaturePackageResponse>> GetSignaturePackageAsync(int packageNumber)
        {
            IEnumerable<SignaturePackageResponse> result = Enumerable.Empty<SignaturePackageResponse>();

            try
            {
                var connection = await _session.GetReadOnlyConnectionAsync();

                if (connection == null)
                {
                    throw new NullReferenceException("Database connection is null. Check _session.GetReadOnlyConnectionAsync().");
                }

                result = await connection.QueryAsync<SignaturePackageResponse>(
                    "[dbo].[BKO_FlowGetSignaturePackage]",
                    new { PackageNumber = packageNumber },
                    commandType: CommandType.StoredProcedure
                );
                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in GetSignaturePackageAsync: {ex.Message}");
            }

            return result;
        }

        public async Task<IEnumerable<PointOfSale>> GetPointOfSaleAsync(int companyId, string user, int state)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<PointOfSale>(
               "[dbo].[BKO_GetPointOfSaleByUser]",
               new
               {
                   UserId = user,
                   CompanyId = companyId,
                   State = state
               },
               commandType: CommandType.StoredProcedure
           );
            return result;
        }

        public async Task<IEnumerable<SubPaymentType>> GetSubPaymentTypeByPaymentIdAsync(int CompanyId, int PaymentId, int PointOfSaleId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.QueryAsync<SubPaymentType>("[dbo].[BKO_GetSubPaymentTypeByPaymentId]", new
            {
                CompanyId = CompanyId,
                PaymentId = PaymentId,
                PointOfSaleId = PointOfSaleId,
            }, commandType: CommandType.StoredProcedure);

            return result;
        }

        public async Task<IEnumerable<PointOfSaleDailySummary>> GetPointOfSaleDailySummaryAsync(int CompanyId, int OpeningCode)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.QueryAsync<PointOfSaleDailySummary>("[dbo].[BKO_PointOfSaleDailySummery]", new
            {
                openingCode = OpeningCode,
                companyId = CompanyId
            }, commandType: CommandType.StoredProcedure);

            return result;
        }

        public async Task<IEnumerable<PayType>> GetPaymentTypeAsync(int CompanyId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.QueryAsync<PayType>("[dbo].[BKO_GetPaymentType]", new
            {
                CompanyId = CompanyId
            }, commandType: CommandType.StoredProcedure);

            return result;
        }

        public async Task<int> ClosePointOfSaleAsync(int OpeningId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.QueryFirstOrDefaultAsync<int>("[dbo].[BKO_ClosePointOfSale]", new
            {
                openingId = OpeningId
            }, commandType: CommandType.StoredProcedure);

            return result;
        }

        public async Task<IEnumerable<PointOfSaleDetail>> GetPointOfDetailByOpeningCodeAsync(int companyId, int? openingCode, int? pointOfSaleId, DateTime? chooseDate)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            IEnumerable<PointOfSaleDetail> result = Enumerable.Empty<PointOfSaleDetail>();
            if (chooseDate != null) 
            {
                result = await connection.QueryAsync<PointOfSaleDetail>(
                    "[dbo].[BKO_GetDailyReportByDate]",
                    new
                    {
                        inputDate = chooseDate,
                        companyId = companyId,
                        pointOfSaleId = pointOfSaleId
                    },
                    commandType: CommandType.StoredProcedure
                );
            }
            else
            {
                result = await connection.QueryAsync<PointOfSaleDetail>(
                    "[dbo].[BKO_GetPointOfDetailByOpeningCode]",
                    new
                    {
                        openingCode = openingCode,
                        companyId = companyId
                    },
                    commandType: CommandType.StoredProcedure
                );
            }
            return result;
        }

        public async Task<int> StartPointOfSaleAsync(int companyId, string user, int pointOfSaleId, int inDollars, int inLocal)
        {

            var connection = await _session.GetReadOnlyConnectionAsync();
            var parameters = new DynamicParameters();
            parameters.Add("CAJA_ID", pointOfSaleId, DbType.Int32);
            parameters.Add("USUARIO", user, DbType.String);
            parameters.Add("ID_EMPRESA", companyId, DbType.Int32);
            parameters.Add("MONTO_COLONES", inLocal, DbType.Int32);
            parameters.Add("MONTO_DOLARES", inDollars, DbType.Int32);
            parameters.Add("RESULTADO", dbType: DbType.Int32, direction: ParameterDirection.Output);

            await connection.ExecuteAsync("[dbo].[BKO_StartPointOfSale]", parameters, commandType: CommandType.StoredProcedure);

            var outputResult = parameters.Get<int>("RESULTADO");
            return outputResult;

        }

        public async Task<int> CashInOutAsync(int companyId, string user, int pointOfSaleId, int inDollars, int inLocal,int openingId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var parameters = new DynamicParameters();
            parameters.Add("CAJA_ID", pointOfSaleId, DbType.Int32);
            parameters.Add("USUARIO", user, DbType.String);
            parameters.Add("ID_EMPRESA", companyId, DbType.Int32);
            parameters.Add("MONTO_COLONES", inLocal, DbType.Int32);
            parameters.Add("MONTO_DOLARES", inDollars, DbType.Int32);
            parameters.Add("COD_APERTURA", openingId, DbType.Int32);
            parameters.Add("RESULTADO", dbType: DbType.Int32, direction: ParameterDirection.Output);
            await connection.ExecuteAsync("[dbo].[BKO_CashInOut]", parameters, commandType: CommandType.StoredProcedure);

            var outputResult = parameters.Get<int>("RESULTADO");
            return outputResult;

        }

        public async Task<int> PaymentForInvoicesAsync(int customerId, string invoiceCSV, double localAmount, double dollarAmount, double paidAmount, double changeAmount, int currencyCode, string paymentType, int subPaymentTypeId, string reference, int pointOfSaleId, int companyId, bool partialPayment, bool creditPayment, string user)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new DynamicParameters();
            parameters.Add("@inCustomerId", customerId, DbType.Int32);
            parameters.Add("@inInvoiceCSV", invoiceCSV, DbType.String);
            parameters.Add("@localAmount", localAmount, DbType.Double);
            parameters.Add("@dollarAmount", dollarAmount, DbType.Double);
            parameters.Add("@inPaidAmount", paidAmount, DbType.Double);
            parameters.Add("@inChangeAmount", changeAmount, DbType.Double);
            parameters.Add("@inCurrencyCode", currencyCode, DbType.Int32);
            parameters.Add("@inPaymentType", paymentType, DbType.String);
            parameters.Add("@inSubPaymentTypeId", subPaymentTypeId, DbType.Int32);
            parameters.Add("@inReference", reference, DbType.String);
            parameters.Add("@inPointOfSaleId", pointOfSaleId, DbType.Int32);
            parameters.Add("@inCompanyId", companyId, DbType.Int32);
            parameters.Add("@inPartialPayment", partialPayment, DbType.Boolean);
            parameters.Add("@inCreditPayment", creditPayment, DbType.Boolean);
            parameters.Add("@inUser", user, DbType.String);
            parameters.Add("@outPaymentId", dbType: DbType.Int32, direction: ParameterDirection.Output);
            await connection.ExecuteAsync("[dbo].[BKO_Payment]", parameters, commandType: CommandType.StoredProcedure);

            var paymentId = parameters.Get<int>("@outPaymentId");

            return paymentId;
        }


        public async Task<int> CancelPaymentAsync(int CompanyId, int PaymentId,string UserId)
        {

            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.ExecuteAsync("[dbo].[BKO_INV_CancelPayment]", new
            {
                ID_EMPRESA = CompanyId,
                ID_PAGO = PaymentId,
                USUARIO = UserId
            }, commandType: CommandType.StoredProcedure);

            return result;
        }

    }
}
