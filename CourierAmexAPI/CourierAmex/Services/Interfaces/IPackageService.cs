using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public interface IPackageService
    {
        Task<GenericResponse<PackageModel>> GetByIdAsync(int id);
        Task<GenericResponse<PackageModel>> GetByPackageNumberAsync(int companyId = 0, int packageNumber = 0);
        Task<PagedResponse<PackageModel>> GetPagedAsync(FilterByRequest request, int companyId = 0, int stateId = 0);
        Task<GenericResponse<PackageModel>> CreateAsync(PackageModel entity, Guid userId);
        Task<GenericResponse<PackageModel>> UpdateAsync(PackageModel entity, Guid userId);
        Task<GenericResponse<bool>> DeleteAsync(int id, Guid userId);
        Task<PagedResponse<PackageEventModel>> GetEventsPagedAsync(FilterByRequest request, int companyId = 0);
        Task<PagedResponse<PackageCategoryModel>> GetPagedByManifestAsync(FilterByRequest request, int companyId = 0, int manifestId = 0);
        Task<PagedResponse<PackageCategoryModel>> GetPagedPriceByManifestAsync(FilterByRequest request, int companyId = 0, int manifestId = 0);
        Task<PagedResponse<PackageCategoryModel>> GetByManifestAirGuideAsync(int companyId = 0, int manifestId = 0, string airGuide = "");

        Task<GenericResponse<PackageCategoryModel>> CategoryUpdateAsync(BulkPackageCategory entity, Guid userId);
        Task<GenericResponse<Models.ClassifyPackage>> ClassifyPackageAsync(Models.ClassifyPackage entity, Guid userId);
        Task<GenericResponse<PackageDetail>> GetPackageDetailByManifestId(int manifestId);
        Task<GenericResponse<PackageDetail>> GetPackageDetailByManifestIdAndAirGuideIdAsync(string airGuideId, int manifestId);
        Task<GenericResponse<List<PackagedPackage>>> GetPackagedPackages(string airGuideId, int manifestId, int packed);
        Task<GenericResponse<List<PackagedPackage>>> GetAirGuideManifest(int manifestId);
        Task<GenericResponse<string>> PackagePriceUpdate(List<PackagePriceUpdateModel> packages);
        Task<GenericResponse<string>> PackagePriceUpdate(PackagePriceUpdateModel package);
        Task<GenericResponse<string>> GetNextConsecutivoAsync(string packagingType, int length);
        Task<GenericResponse<PackagedPackagedResponse>> GetPackedPackages(string category, string airGuideId, int manifestId, int packed, int? pallet);
        Task RegisterBagPackaging(int manifestId, string bag, int taxType, decimal width, decimal height, decimal length, decimal actualVolumeWeight, decimal actualWeight, decimal systemVolumeWeight, decimal systemWeight, int packages, string packagingType, int sequence, string category, string user, int? isConsolidated, int? pallet);
        Task<GenericResponse<int>> PackPackage(int? packageNumber, string? bagNumber, int? palet, string? manifestNumber, int? packageSubType, string? user);
        Task<GenericResponse<int>> PackPackageGuide(int? packageNumber, string? bagNumber, int? palet, string? manifestNumber, int? packageSubType, string? user);
        Task UnpackPackage(int? packageNumber);
        Task UnpackPackageConsolidated(int? packageNumber);

        Task<GenericResponse<int>> UnassignPackageAsync(int packageId, int manifestId, int initialStateId, string modifiedBy, bool forceRemove);
        Task<GenericResponse<List<ManifestPackage>>> GetManifestPackageAsync(string manifestNumber);
        Task<GenericResponse<List<PackageModel>>?> SearchPackageAsync(int packageNumber, string courierNumber, string customerAccount);
        Task<GenericResponse<PackageModel>?> GetPackageForCustomerServiceAsync(int id);

        Task<GenericResponse<List<PackageInvoiceStatus>> >GetPackagesByInvoiceStatusAsync(GetPackageByInvoiceStatusRequest request);

        Task<GenericResponse<int>> UpdatePackageInvoiceStatusAsync(UpdatePackageInvoiceStatusRequest request);
        Task<GenericResponse<string>> UpdatePackageCommodityAndPrice(UpdatePackageCommodityPriceModel package);


        Task<GenericResponse<List<PendingBillingPackageModel>>> GetPendingBillingPackagesAsync(int companyId);

        Task<GenericResponse<List<Commodities>>> GetCommoditiesAsync(int companyId);
    }
}
