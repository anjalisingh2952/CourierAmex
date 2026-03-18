using CourierAmex.Models;
using CourierAmex.Services.Interfaces;
using CourierAmex.Storage.Repositories;
using CourierAmex.Storage.Repositories.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace CourierAmex.Services
{
    public class DashboardService : IDashboardService
    {
        public readonly IDashboardRepository _dashboardRepository;
        public DashboardService(IDashboardRepository dashboardRepository)
        {
            _dashboardRepository = dashboardRepository;
        }

        public async Task<GenericResponse<Object>> GetDashboardData(string clientId, DateTime fromDate, DateTime toDate, string filters, int? idEmpresa = null,string? selectedMonth = null,string? selectedfilter = null)
        {
            GenericResponse<object> result = new();
            var data = await _dashboardRepository.GetChartDataAsync(clientId, fromDate, toDate, filters, idEmpresa,selectedMonth,selectedfilter);
            if (data != null)
            {
                result.Success = true;
                result.Data = data;
            }
            return result;
        }

        public async Task<GenericResponse<Object>> GetProductChartDetail(int idEmpresa, DateTime fechaInicio, DateTime fechaFin, string? invoiceId = null, int? productId = null, string months = "Blank")
        {
            GenericResponse<object> result = new();
            var data = await _dashboardRepository.GetProductChartDetailAsync(idEmpresa,fechaInicio,fechaFin,invoiceId,productId , months);
            if (data != null)
            {
                result.Success = true;
                result.Data = data;
            }
            return result;
        }

        public async Task<GenericResponse<Object>> GetProductDetailsPaginated(int idEmpresa, DateTime fechaInicio, DateTime fechaFin, string? invoiceId = null, int? productId = null, int pageNumber = 1, int pageSize = 10, string months = "Blank")
        {
            GenericResponse<object> result = new();
            var (productList, totalCount) = await _dashboardRepository.GetProductDetailsPaginatedAsync(idEmpresa,fechaInicio,fechaFin,invoiceId,productId,pageNumber,pageSize,months);
            if (totalCount > 0)
            {
                result.Success = true;
                result.Data = new List<object> { productList, totalCount }; ;
            }
            return result;
        }
    }
}
