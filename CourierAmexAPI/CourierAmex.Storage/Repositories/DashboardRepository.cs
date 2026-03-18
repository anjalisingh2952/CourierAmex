using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Data;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Repositories.Interfaces;

namespace CourierAmex.Storage.Repositories
{
    public class DashboardRepository : IDashboardRepository
    {
        private readonly IDalSession _session;

        public DashboardRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<List<object>> GetChartDataAsync(string clientId, DateTime fromDate, DateTime toDate, string filters, int? idEmpresa = null, string? selectedMonth = null, string? selectedfilter = null)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new
            {
                CLIENTE = clientId,
                DESDE = fromDate,
                HASTA = toDate,
                LIST = filters,
                ID_EMPRESA = idEmpresa,
                SelectedMonths = selectedMonth,
                Selectedfilter = selectedfilter
            };

            using var multi = await connection.QueryMultipleAsync(
                "BKO_DocumentByCustomerChartData",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            var statusChart = (await multi.ReadAsync<StatusChart>()).ToList();
            var billedPerMonth = (await multi.ReadAsync<BilledPerMonth>()).ToList();
            var paidPerMonth = (await multi.ReadAsync<PaidPerMonth>()).ToList();
            var cashierChart = (await multi.ReadAsync<CashierChart>()).ToList();
            var invoicesPerMonth = (await multi.ReadAsync<InvoicesPerMonth>()).ToList();
            var amountsPerYear = (await multi.ReadAsync<AmountsPerYear>()).ToList();

            return new List<object>
            {
                statusChart,
                billedPerMonth,
                paidPerMonth,
                cashierChart,
                invoicesPerMonth,
                amountsPerYear
            };
        }

        public async Task<(List<ProductDetail> Records, int TotalRecords)> GetProductDetailsPaginatedAsync(int idEmpresa,DateTime fechaInicio,DateTime fechaFin,string? invoiceId = null,int? productId = null,int pageNumber = 1,int pageSize = 10,string months = "Blank")
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new
            {
                ID_EMPRESA = idEmpresa,
                FechaInicio = fechaInicio,
                FechaFin = fechaFin,
                InvoiceId = invoiceId,
                ProductId = productId,
                PageNumber = pageNumber,
                PageSize = pageSize,
                Months = months
            };

            using var multi = await connection.QueryMultipleAsync(
                "BKO_DSH_GetProductDetailsPaginated",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            var records = (await multi.ReadAsync<ProductDetail>()).ToList();
            var totalRecord = await multi.ReadFirstAsync<TotalRecord>();

            return (records, totalRecord.TotalRecords);
        }

        public async Task<List<object>> GetProductChartDetailAsync(int idEmpresa, DateTime fechaInicio, DateTime fechaFin,string? invoiceId = null,int? productId = null,string months = "Blank")
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new
            {
                ID_EMPRESA = idEmpresa,
                FechaInicio = fechaInicio,
                FechaFin = fechaFin,
                InvoiceId = invoiceId,
                ProductId = productId,
                Months = months
            };

            using var multi = await connection.QueryMultipleAsync(
                "BKO_DSH_GetProductChartDetail",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            var productAmountsByYear = (await multi.ReadAsync<ProductAmountByYear>()).ToList();
            var productPercentage = (await multi.ReadAsync<ProductPercentage>()).ToList();
            var totalByProduct = (await multi.ReadAsync<TotalByProduct>()).ToList();

            return new List<object>
            {
                productAmountsByYear,
                productPercentage,
                totalByProduct
            };
        }
    }
}
