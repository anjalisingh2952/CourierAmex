using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IDashboardService
    {
        Task<GenericResponse<Object>> GetDashboardData(string clientId, DateTime fromDate, DateTime toDate, string filters, int? idEmpresa = null, string? selectedMonth = null, string? selectedfilter = null);
        Task<GenericResponse<Object>> GetProductChartDetail(int idEmpresa, DateTime fechaInicio, DateTime fechaFin, string? invoiceId = null, int? productId = null, string months = "Blank");
        Task<GenericResponse<Object>> GetProductDetailsPaginated(int idEmpresa, DateTime fechaInicio, DateTime fechaFin, string? invoiceId = null, int? productId = null, int pageNumber = 1, int pageSize = 10, string months = "Blank");


    }
}
