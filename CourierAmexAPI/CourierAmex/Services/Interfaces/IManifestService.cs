using CourierAmex.Models;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace CourierAmex.Services
{
    public interface IManifestService
    {
        Task<GenericResponse<ManifestModel>> GetByIdAsync(long id);
        Task<PagedResponse<ManifestScanner>> GetManifestScannerAsync(FilterByRequest request, int id);
        Task<PagedResponse<ManifestScanner>> GetManifestScannerWithoutPaginationAsync(int id);
        Task<PagedResponse<ManifestModel>> GetPagedAsync(FilterByRequest request);
        Task<GenericResponse<ManifestModel>> CreateAsync(ManifestModel entity, Guid userId);
        Task<GenericResponse<ManifestModel>> UpdateAsync(ManifestModel entity, Guid userId);
        Task<GenericResponse<ManifestModel>> OpenAsync(long id, Guid userId);
        Task<GenericResponse<bool>> DeleteAsync(long id, Guid userId);
        Task<GenericResponse<List<Manifest>>> GetManifestsByPackageTypeAsync(string companyId, int state, int manifestType, string type);
        Task<GenericResponse<CountManifestScanner>> GetCountManifestScannerAsync(string mn);
        Task<PagedResponse<PendingPackageInfo>> GetPendingPackagesAsync(FilterByRequest request, string mn);
        Task<GenericResponse<ScannedPackageInfo>> GetScannedPackageAsync(string packageNumber, string manifestNumber);
        Task<GenericResponse<ScanLogModel>> CreateScanLogAsync(ScanLogModel entity, Guid userId);
        Task<GenericResponse<int>> PackageScanUpdateAsync(ScannedPackageInfo entity);
        Task<GenericResponse<int>> PackageReassignUpdateAsync(PackageReassign entity, Guid userId);
        Task<GenericResponse<BagInfo>> GetBagInfoAsync(string bag);
        Task<GenericResponse<int>> GetManifestIdByPackageNumberAsync(string _packagenumber);
        Task<GenericResponse<ManifestReport_GeneralInfo>> GetManifestGenralInformationAsync(int companyId, string manifestNumber);
        Task<GenericResponse<List<ManifestReport_BillingInfo>>> GetManifestBillingInformationAsync(int companyId, string manifestNumber);
        Task<GenericResponse<List<ManifestPreAlert>>> GetManifestPreAlertAsync(int companyId, string manifestNumber);
        Task<GenericResponse<ManifestReport_ExcelData>> GetManifestReportExcelDataAsync(int companyId, string manifestNumber);
        Task<GenericResponse<ManifestReport_BagExcelData>> GetManifestReportByBagExcelDataAsync(int companyId, string manifestNumber);

        Task<PackageManifestInfoModel> GetPackageManifestInfo(int CompanyId, int PackageNumber);
        Task<List<RouteSheetModel>> GetFilterRouteSheet(string? manifestId, string? zoneCode, int? status, int? page, int? index, string? filter);
        Task<int> InsertRoute(RouteInsertModel model);
        Task<GenericResponse<int>> UpdateRoadMapStatus(List<int> roadMapId);
        Task<(List<RouteSheetDetailModel> List,int Total)> GetRouteSheetDetail(int routeSheetId, int status, string companyId, int? page, int? index, string? filter);
        Task<List<RoutePackageReportModel>> GetPackageByRouteReport(int routeSheetId);
        Task<GenericResponse<List<DeliveryTypesModel>>> GetDeliveryTypes();
        Task<int> DeletePackageFromRouteMap(List<int>? packageId, int? roadMapId);
        Task<GenericResponse<List<RoadMapstReportModel>>> GetRoadMapsReport(int roadMapId, int companyId = 0);
        Task<GenericResponse<List<ParcelDeliveryReportModel>>> GetParcelDeliveryReport(int roadMapId, int companyId = 0);
        Task<GenericResponse<(int Resultado, bool Facturado)>> GetValidatePackageRoute(int? packageNumber, int? roadMapId);
        Task<GenericResponse<List<CourierDeconsolidationModel>>> GetCourierDeconsolidationDataAsync(int companyId, int manifestId, decimal freightValue, string category);
        Task<GenericResponse<AddManifestPackageResponse>> AddManifestPackageAsync(AddManifestPackageRequest entity);
        Task<GenericResponse<int>> InsertNotification(int packageNumber, string docType, int status);
        Task<GenericResponse<List<PackagingCourierReport>>> GetPackagingCourierReportAsync(int companyId, string manifestNumber);

        Task<GenericResponse<ResponsePackageConsolidateReport>> GetPackagingConsolidatedReportAsync(string manifestNumber, int companyId);

    }
}
