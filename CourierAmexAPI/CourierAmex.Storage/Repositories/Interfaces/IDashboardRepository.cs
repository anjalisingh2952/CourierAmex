using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories.Interfaces
{
    public interface IDashboardRepository
    {
        Task<List<object>> GetChartDataAsync(string clientId, DateTime fromDate, DateTime toDate, string filters, int? idEmpresa = null, string? selectedMonth = null, string? selectedfilter = null);    
        Task<(List<ProductDetail> Records, int TotalRecords)> GetProductDetailsPaginatedAsync(int idEmpresa, DateTime fechaInicio, DateTime fechaFin, string? invoiceId = null, int? productId = null, int pageNumber = 1, int pageSize = 10, string months = "Blank");
        Task<List<object>> GetProductChartDetailAsync(int idEmpresa, DateTime fechaInicio, DateTime fechaFin, string? invoiceId = null, int? productId = null, string months = "Blank");
    } 
}
