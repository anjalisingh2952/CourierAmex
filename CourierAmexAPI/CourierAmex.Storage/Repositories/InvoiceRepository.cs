using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Data;
using System.Data.Common;
using System.Diagnostics.Metrics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Repositories.Interfaces;
using Dapper;
using Newtonsoft.Json;
using static System.Runtime.CompilerServices.RuntimeHelpers;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace CourierAmex.Storage.Repositories
{
    public class InvoiceRepository : IInvoiceRepository
    {
        private readonly IDalSession _session;

        public InvoiceRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<(IEnumerable<Invoice> invoices, int totalRows)> GetDocumentByCustomerAsync(string clientId,string fromDate,string toDate,string filters,int? pageNumber = null,int? pageSize = null)
        {
            var fromDateTime = DateTime.TryParse(fromDate, out DateTime fromDateParsed) ? fromDateParsed : (DateTime?)null;
            var toDateTime = DateTime.TryParse(toDate, out DateTime toDateParsed) ? toDateParsed : (DateTime?)null;

            var connection = await _session.GetReadOnlyConnectionAsync();

            using (var multiResult = await connection.QueryMultipleAsync(
                "[dbo].[BKO_DocumentByCustomer]",
                new
                {
                    CLIENTE = clientId,
                    DESDE = fromDateTime,
                    HASTA = toDateTime,
                    LIST = filters,
                    PageNumber = pageNumber,
                    PageSize = pageSize
                },
                commandType: System.Data.CommandType.StoredProcedure))
            {
                var invoices = await multiResult.ReadAsync<Invoice>();
                var totalRows = 0;
                if (pageNumber != null)
                {
                    totalRows  = (await multiResult.ReadAsync<int>()).FirstOrDefault();
                }

                return (invoices, totalRows);
            }
        }


        public async Task<string> GenerateAccountingEntryAsync(int companyId,string periodDate,string entryDate,string entryDescription,string statusIndicator,string sourceSystemCode,string systemIndicator,string inclusionDate,int inclusionUser)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryFirstOrDefaultAsync<string>(
                "[dbo].[BKO_INV_GenerateAccountingEntry]",
                new
                {
                    ID_EMPRESA = companyId,
                    FEC_PERIODO = DateTime.Parse(periodDate),
                    FEC_ASIENTO = DateTime.Parse(entryDate),
                    DET_ASIENTO = entryDescription,
                    IND_ESTADO = statusIndicator,
                    COD_SISTEMA_ORIGEN = sourceSystemCode,
                    IND_SISTEMA = systemIndicator,
                    FEC_INCLUSION = DateTime.Parse(inclusionDate),
                    USER_INCLUSION = inclusionUser
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return result;
        }

        public async Task<int> GenerateAccountingEntryInvoiceAsync(int companyId, string entryCode, int invoiceNumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.ExecuteAsync(
                "[dbo].[BKO_INV_GenerateAccountingEntry_Invoice]",
                new
                {
                    ID_EMPRESA = companyId,
                    COD_ASIENTO = entryCode,
                    N_FACTURA = invoiceNumber
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return result;
        }

        public async Task<IEnumerable<TemplateAccount>> SelectTemplateAccountAsync(int companyId, string moduleCode, int templateCode)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<TemplateAccount>(
                "[dbo].[BKO_INV_SelectTemplateAccount]",
                new
                {
                    ID_EMPRESA = companyId,
                    COD_MODULO = moduleCode,
                    COD_PLANTILLA = templateCode
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return result;
        }

        public async Task<IEnumerable<int>> ValidateAccountingEntryAsync(int companyId, string entryCode)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<int>(
                "[dbo].[BKO_INV_ValidateAccountingEntry]",
                new
                {
                    ID_EMPRESA = companyId,
                    COD_ASIENTO = entryCode
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return result;
        }

        public async Task<IEnumerable<int>> ApplyAccountingEntryAsync(int companyId, string entryCode)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<int>(
                "[dbo].[BKO_INV_ApplyAccountingEntry]",
                new
                {
                    ID_EMPRESA = companyId,
                    COD_ASIENTO = entryCode
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return result;
        }


        //Insert Account Detail
        public async Task<int> InsertAccountingDetailAsync(AccountingDetail accountingDetail)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.ExecuteAsync("[dbo].[BKO_INV_InsertAccountingDetail]",
                new
                {
                    ID_EMPRESA = accountingDetail.CompanyId,
                    COD_ASIENTO = accountingDetail.EntryCode,
                    FEC_PERIODO = accountingDetail.PeriodDate,
                    NUM_LINEA_ASIENTO = accountingDetail.EntryLineNumber,
                    MONTO_MOV = accountingDetail.TransactionAmount,
                    NUM_CUENTA = accountingDetail.AccountNumber,
                    IND_DEBCRE = accountingDetail.DebitCreditIndicator,
                    MON_TIPO_CAMBIO = accountingDetail.ExchangeRate,
                    MONTO_ORIGINAL = accountingDetail.OriginalAmount,
                    MONEDA_ORIGINAL = accountingDetail.OriginalCurrency,
                    COD_CLIENTE = accountingDetail.ClientCode,
                    CIERRE_ASIENTO = accountingDetail.EntryClosureCode
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return result;
        }

        public async Task<IEnumerable<Invoice>> InvoicesPendingByCustomer(string clientId)
        {
            // Get the connection
            var connection = await _session.GetReadOnlyConnectionAsync();

            return await connection.QueryAsync<Invoice>("[dbo].[BKO_InvoicesPendingByCustomer]", new
            {
                CLIENTEID = clientId
            },
            commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<InvoiceDetails>> GetPackagesByInvoice(int invoiceNumber)
        {
            // Get the connection
            var connection = await _session.GetReadOnlyConnectionAsync();

            return await connection.QueryAsync<InvoiceDetails>("[dbo].[BKO_GetPackagesByInvoice]", new
            {
                InvoiceNumber = invoiceNumber
            },
            commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<FullInvoiceResult> GetInvoiceInfoByIdAsync(int invoiceId)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();
            using var multi = await connection.QueryMultipleAsync("[dbo].[BKO_POS_GetInvoiceDetail]",
                new { InvoiceNumber = invoiceId },
                commandType: System.Data.CommandType.StoredProcedure);

            var invoiceInfo = (await multi.ReadAsync<Invoice>()).FirstOrDefault();
            var invoiceDetails = (await multi.ReadAsync<Invoice>()).ToList();
            var company = (await multi.ReadAsync<Company>()).FirstOrDefault();
            var packages = (await multi.ReadAsync<Package>()).ToList();
            var balance = (await multi.ReadAsync<float>()).FirstOrDefault();

            if (connection.State != System.Data.ConnectionState.Closed)
            {
                await connection.CloseAsync();
            }

            return new FullInvoiceResult
            {
                Invoice = invoiceInfo,
                Details = invoiceDetails,
                Company = company,
                Packages = packages,
                Balance = balance
            };
        }

        public async Task<FullInvoiceResult> GetPaymentInfoByIdAsync(int paymentId, int invoiceNumber)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();
            using var multi = await connection.QueryMultipleAsync("[dbo].[BKO_POS_GetPaymentDetail]",
                new
                {
                    PaymentID = paymentId,
                    InvoiceNumber = invoiceNumber
                },
                commandType: System.Data.CommandType.StoredProcedure);

            var invoiceInfo = (await multi.ReadAsync<Invoice>()).FirstOrDefault();
            var invoiceDetails = (await multi.ReadAsync<Invoice>()).ToList();
            var company = (await multi.ReadAsync<Company>()).FirstOrDefault();
            var packages = (await multi.ReadAsync<Package>()).ToList();
            var balance = (await multi.ReadAsync<float>()).FirstOrDefault();

            if (connection.State != System.Data.ConnectionState.Closed)
            {
                await connection.CloseAsync();
            }

            return new FullInvoiceResult
            {
                Invoice = invoiceInfo,
                Details = invoiceDetails,
                Company = company,
                Packages = packages,
                Balance = balance
            };
        }

        public async Task<IEnumerable<Invoice>> GetInvoiceInfoDetailByIdAsync(int invoiceId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Invoice>("[dbo].[FC_SP_GETINFOINVOICEDETAIL]", new
            {
                InvoiceNumber = invoiceId,
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<PaymentInfo> GetPaymentDetailsAsync(int companyId, int paymentId)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();
            var multi = await connection.QueryMultipleAsync(
                "[dbo].[BKO_GetPaymentInfo]",
                new { CompanyId = companyId, PaymentId = paymentId },
                commandType: System.Data.CommandType.StoredProcedure);

            var paymentDetails = await multi.ReadAsync<PaymentInfo>();

            return paymentDetails.FirstOrDefault();
        }

        public async Task<List<PaymentInfo>> GetPaymentDetailsForLableAsync(int companyId, int paymentId)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<PaymentInfo>(
                "[dbo].[BKO_GetPaymentInfo]",
                new { CompanyId = companyId, PaymentId = paymentId },
                commandType: System.Data.CommandType.StoredProcedure);

            return result.ToList();
        }


        public async Task<List<PaymentInfo>> GetPaymentInfoByInvoiceIdAsync(int companyId, int InvoiceNumber)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<PaymentInfo>(
                "[dbo].[BKO_GetPaymentInfoByInvoiceId]",
                new { CompanyId = companyId, InvoiceNumber = InvoiceNumber },
                commandType: System.Data.CommandType.StoredProcedure);

            return result.ToList();
        }


        public async Task<IEnumerable<CourierAmex.Storage.Domain.PendingInvoiceReport>> GetPendingInvoicesReportAsync(int companyId, DateTime startDate, DateTime endDate, int paymentType, int zoneId)
        {
            try
            {
                // Ensure you get a read-only connection from the session
                var connection = await _session.GetReadOnlyConnectionAsync();

                // Use the connection for querying the stored procedure
                var result = await connection.QueryAsync<PendingInvoiceReport>(
                    "[dbo].[BKO_REPORTE_PENDING_INVOICES]",
                    new
                    {
                        CompanyId = companyId,
                        StartDate = startDate,
                        EndDate = endDate,
                        PaymentType = paymentType,
                        ZoneId = zoneId
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );

                // If data is null or empty, return an empty list
                return result?.ToList() ?? new List<PendingInvoiceReport>();
            }
            catch (Exception ex)
            {


                // Optionally rethrow or handle the error accordingly
                // For now, return an empty list to avoid null reference errors
                return new List<PendingInvoiceReport>();
            }
        }

        public async Task<IEnumerable<SalesReport>> GetSalesReportAsync(int companyId, DateTime startDate, DateTime endDate, string customerCode)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            try
            {
                var res = await connection.QueryAsync<SalesReport>(
                    "[dbo].[BKO_SALES_REPORT]",
                    new
                    {
                        CompanyId = companyId,
                        StartDate = startDate,
                        EndDate = endDate,
                        customerCode = customerCode // Optional filter
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );

                return res;
            }
            catch (Exception ex)
            {
                // Handle exception (optional logging)
                return null;
            }
        }

        public async Task<bool> IsElectronicInvoiceProcessedAsync(int companyId, int invoiceId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {
                var result = await connection.QuerySingleAsync<int>(
                    "[dbo].[BKO_INV_ElectronicInvoiceExists]",
                    new
                    {
                        N_FACTURA = invoiceId,
                        ID_EMPRESA = companyId
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );
                return result > 0;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<int> InsertCreditNoteAsync(CreditNoteInsertRequest request)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new
            {
                Id_Reconciliacion = request.ReconciliationId,
                Id_Empresa = request.CompanyId,
                Id_TipoClienteProveedor = request.ClientOrSupplierType,
                CodigoClienteProveedor = request.ClientOrSupplierCode ?? "",
                COD_MONEDA = request.CurrencyCode,
                TipoCambio = request.ExchangeRate,
                Monto = request.Amount,
                Observacion = request.Observation,
                Estado = request.Status,
                FechaSistema = request.SystemDate,
                Fecha = request.TransactionDate,
                Rubro = request.Category,
                USER_MODIFICA = request.ModifiedByUserId,
                N_FACTURA = request.InvoiceNumber,
                AccionNotaCredito = request.CreditNoteAction,
                MONTOFACTURADOLARES = request.InvoiceAmountInDollars,
                MONTOFACTURACOLONES = request.InvoiceAmountInColones,
                COD_ASIENTO = request.AccountingEntryCode,
                AplicarFacturaElectronica = request.ApplyElectronicInvoice
            };

            var daa = parameters.ToString();
            var ss = JsonConvert.SerializeObject(parameters);

            int rowsAffected = await connection.ExecuteAsync(
                "[dbo].[BKO_INV_InsertCraditNote]",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            Console.WriteLine(JsonConvert.SerializeObject(parameters));

            return rowsAffected;
        }

        public async Task<int> CancelInvoiceAsync(int companyId, int invoiceId, string userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new DynamicParameters();
            parameters.Add("ID_EMPRESA", companyId);
            parameters.Add("N_FACTURA", invoiceId);
            parameters.Add("USUARIO", userId);

            int rowsAffected = await connection.ExecuteAsync(
                "[dbo].[BKO_INV_CancelInvoice]",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return rowsAffected;
        }


        public async Task<int> InsertCustomsTaxLoadAsync(List<CustomsTaxLoad> taxLoadList)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var table = new DataTable();
            table.Columns.Add("CRTRACK", typeof(string));
            table.Columns.Add("Transaction", typeof(string));
            table.Columns.Add("FOB", typeof(decimal));
            table.Columns.Add("CIF", typeof(decimal));
            table.Columns.Add("Amount", typeof(decimal));
            table.Columns.Add("DUA", typeof(string));
            table.Columns.Add("CompanyId", typeof(int));
            table.Columns.Add("CreatedBy", typeof(string));
            table.Columns.Add("CreatedDate", typeof(DateTime));
            table.Columns.Add("LoadType", typeof(string));

            foreach (var item in taxLoadList)
            {
                table.Rows.Add(
                    item.crtrack,
                    item.transaction,
                    item.fob,
                    item.cif,
                    item.amount,
                    item.dua,
                    item.companyId,
                    item.createdBy,
                    item.createdDate,
                    item.loadType
                );
            }

            var parameters = new DynamicParameters();
            parameters.Add("@CustomsTaxTable", table.AsTableValuedParameter("dbo.CustomsTaxLoadRequest"));

            int rowsAffected = await connection.ExecuteAsync(
                "[dbo].[BKO_InsertCustomsTaxLoad]",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return rowsAffected;
        }


        public async Task<int?> GetCustomsTaxByPackageNumberAsync(string packageNumber)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryFirstOrDefaultAsync<int>(
                "[dbo].[BKO_GetCustomsTax_ByPackageNumber]",
                new { PackageNumber = Convert.ToInt32(packageNumber) },
                commandType: CommandType.StoredProcedure);

            return result;
        }


        public async Task<int?> GetCustomsTaxByBagAsync(string bag)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryFirstOrDefaultAsync<int>(
                "[dbo].[BKO_GetCustomsTax_ByBag]",
                new { Bag = bag },
                commandType: CommandType.StoredProcedure);

            return result;
        }

        public async Task<IEnumerable<AeropostMassUploadReport>> GetAeropostMassUploadReportAsync(int companyId, DateTime startDate, DateTime endDate, int providerId)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();
            var parameters = new
            {
                PROVIDER_ID = providerId,   
                COMPANY_ID = companyId,     
                StartDate = startDate,      
                EndDate = endDate           
            };

            try
            {
                return await connection.QueryAsync<AeropostMassUploadReport>(
                    "[dbo].[BKO_Report_MassUpload_Aeropost]",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );
            }
            catch (Exception ex)
            {
                // Handle exception (optional logging)
                return null;
            }
        }


        public async Task<IEnumerable<CustomsTaxesReportModel>> GetCustomsTaxesReportAsync(string customerCode, DateTime fromDate, DateTime toDate, string manifestNumber, string bag)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<CustomsTaxesReportModel>(
                "[dbo].[BKO_REPORTE_CUSTOMS_TAXES]",
                new
                {
                    CustomerCode = customerCode,
                    FromDate = fromDate.ToString("yyyy-MM-dd"),
                    ToDate = toDate.ToString("yyyy-MM-dd"),
                    ManifestNumber =  manifestNumber,
                    Bag =  bag
                },
                commandType: CommandType.StoredProcedure
            );

            return result;
        }




    }
}