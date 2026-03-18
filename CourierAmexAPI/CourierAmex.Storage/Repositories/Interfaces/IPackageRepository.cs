using CourierAmex.Storage.Domain;
namespace CourierAmex.Storage.Repositories
{
    public interface IPackageRepository
    {
        Task<Package?> GetByIdAsync(int id);
        Task<Package?> GetByPackageNumberAsync(int companyId = 0, int packageNumber = 0);
        Task<IEnumerable<Package>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0, int stateId = 0);
        Task<IEnumerable<Package>> ValidateNumberAsync(int id, int number);
        Task<Package?> CreateOrUpdateAsync(Package entity, Guid userId);
        Task<int> ValidateDeleteAsync(int id);
        Task<IEnumerable<PackageEvent>> GetEventsPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0);
        Task<IEnumerable<Package>> GetPagedByManifestAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0, int manifestId = 0);
        Task<IEnumerable<Package>> GetPagedPriceByManifestAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0, int manifestId = 0);
        Task<IEnumerable<Package>> GetByManifestAirGuideAsync(int companyId = 0, int manifestId = 0, string airGuide = "");
        Task<PackageCategory?> CategoryUpdateAsync(PackageCategory entity, Guid userId);
        Task<ClassifyPackage?> ClassifyPackageAsync(ClassifyPackage entity, Guid userId);
        Task<PackageDetail> GetPackageDetailByManifestId(long manifestId);
        Task<PackageDetail> GetPackageDetailByManifestIdAndAirGuideIdAsync(string airGuideId, int manifestId);
        Task<IEnumerable<PackagedPackage>> GetPackagedPackages(string airGuideId, int manifestId, int packed);
        Task<IEnumerable<PackagedPackage>> GetAirGuideManifest(int manifestId);
        Task<string> PackagePriceUpdateBulkAsync(List<PackagePrice> packages);
        Task<string> PackagePriceUpdateAsync(PackagePrice priceData);
        Task RegisterBagPackagingAsync(int manifestId, string bag, int taxType, decimal width, decimal height, decimal length, decimal actualVolumeWeight, decimal actualWeight, decimal systemVolumeWeight, decimal systemWeight, int packages, string packagingType, int sequence, string category, string user, int? isConsolidated, int? pallet);
        Task<PackagedPackagedResponse> GetPackedPackages(string category, string airGuideId, int manifestId, int packed, int? pallet);
        Task<string> GetNextConsecutivoAsync(string packagingType, int length);
        Task<int> PackPackageAsync(int? packageNumber, string? bagNumber, int? palet, string? manifestNumber, int? packageSubType, string? user);
        Task<int> PackPackageGuideAsync(int? packageNumber, string? bagNumber, int? palet, string? manifestNumber, int? packageSubType, string? user);
        Task UnpackPackageAsync(int? packageNumber);
        Task UnpackPackageConsolidatedAsync(int? packageNumber);

        Task<int> UnassignPackageAsync(int packageId, int manifestId, int initialStateId, string modifiedBy, bool forceRemove);

        Task<IEnumerable<ManifestPackage>?> GetManifestPackageAsync(string manifestNumber);
        Task<IEnumerable<Package>> SearchPackageAsync(int packageNumber, string courierNumber, string customerAccount);
        Task<Package?> GetPackageForCustomerServiceAsync(int id);

        Task<List<PackageInvoiceStatus>> GetPackagesByInvoiceStatusAsync(GetPackageByInvoiceStatusRequest request);
        Task<int> UpdatePackageInvoiceStatusAsync(UpdatePackageInvoiceStatusRequest request);

        Task<string> UpdatePackageCommodityAndPriceAsync(UpdatePackageCommodityPriceModel packageData);

        Task<List<PendingBillingPackageModel>> GetPendingBillingPackagesAsync(int companyId);

        Task<List<Commodities>>GetCommoditiesAsync(int companyId);
    }
}