using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public interface IManifestRepository
    {
        Task<IEnumerable<Manifest>> ValidateNumberAsync(long id, string number);
        Task<IEnumerable<Manifest>> GetPagedAsync(FilterByDomain request);
        Task<Manifest?> GetByIdAsync(long id);
        Task<IEnumerable<ManifestScanner>> GetManifestScanner(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
        Task<IEnumerable<ManifestScanner>> GetManifestScannerWithoutPagination(int companyId = 0);

        Task<Manifest?> CreateOrUpdateAsync(Manifest entity, Guid userId);
        Task<long> ValidateDeleteAsync(long id);
        Task<IEnumerable<Manifest>> GetManifestsByPackageTypeAsync(string ComapanyId, int State, int ManifestType, string Type);
        Task<CountManifestScanner?> GetCountManifestScanner(string mn);
        Task<IEnumerable<PendingPackageInfo>> GetPendingPackages(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", string mn = "");
        Task<ScannedPackageInfo?> GetScannedPackage(string packageNumber);
        Task<ScanLog?> CreateScanLogAsync(ScanLog entity, Guid userId);
        Task<int> DeletePackageFromRouteMapAsync(List<int>? packageId, int? roadMapId);
        Task<IEnumerable<RoadMapstReport>> GetRoadMapsReportAsync(int roadMapId, int companyId = 0);
        Task<IEnumerable<ParcelDeliveryReport>> GetParcelDeliveryReportAsync(int roadMapId, int companyId = 0);
        Task<int> PackageScanUpdateAsync(ScannedPackageInfo entity);
        Task<int> PackageReassignUpdateAsync(PackageReassign entity, Guid userId);
        Task<BagInfo?> GetBagInfo(string bag);
        Task<int> GetManifestIdByPackageNumber(string _packagenumber);
        Task<ManifestReport_GeneralInfo?> GetManifestGenralInformation(int companyId, string manifestNumber);
        Task<IEnumerable<ManifestReport_BillingInfo>> GetManifestBillingInformation(int companyId, string manifestNumber);
        Task<IEnumerable<ManifestPreAlert>> GetManifestPreAlert(int companyId, string manifestNumber);
        Task<ManifestReport_ExcelData> GetManifestReportExcelData(int companyId, string manifestNumber);
        Task<ManifestReport_BagExcelData> GetManifestReportBagExcelData(int companyId, string manifestNumber);
        Task<IEnumerable<CourierDeconsolidationModel>> GetCourierDeconsolidationDataAsync(int companyId, int manifestId, decimal freightValue, string category);
        Task<PackageManifestInfo> GetPackageManifestInfoAsync(int CompanyId, int PackageNumber);
        Task<int> InsertRouteAsync(RouteInsert model);
        Task<IEnumerable<RouteSheet>> GetFilterRouteSheetAsync(string? manifestId, string? zoneCode, int? status, int? page, int? index, string? filter);
        Task<(IEnumerable<RouteSheetDetail> List, int Total)> GetRouteSheetDetailAsync(int routeSheetId, int status, string companyId, int? page, int? index, string? filter);        Task<IEnumerable<RoutePackageReport>> GetPackageByRouteReportAsync(int routeSheetId);
        Task<List<DeliveryTypes>> GetDeliveryTypesAsync();
        Task<(int Resultado, bool Facturado)> GetValidatePackageRouteAsync(int? packageNumber, int? roadMapId);
        Task<AddManifestPackageResponse?> AddManifestPackageAsync(AddManifestPackageRequest entity);
        Task<int> InsertNotificationAsync(int packageNumber, string docType, int status);
        Task<IEnumerable<PackagingCourierReport>> GetPackagingCourierReport(int companyId, string manifestNumber);

        Task<ResponsePackageConsolidateReport> GetPackagingConsolidatedReportAsync(string manifestNumber, int companyId);

    
        Task<int> UpdateRoadMapStatusAsync(List<int> roadMapId);
    }
}
