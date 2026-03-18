using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{

    public interface IAirGuideRepository
    {
        Task<IEnumerable<AirGuide?>> GetAirGuidesByIdAsync(long manifestId, int companyId = 0);
        Task<IEnumerable<MasterGuide>> GetMasterGuideAsync(long manifestId);
        Task<IEnumerable<AirGuide?>> GetAirGuideByManifestIdAsync(int manifestId);
        Task<IEnumerable<PackageCategory>> GetPackagesByAirGuideByManifestId(int manifestId, string guideNumber, int companyId = 0);
        Task<int> CreateOrUpdateMasterGuideAsync(MasterGuide model);
        Task<int> CreateOrUpdateChildGuideAsync(ChildGuide model);
        Task<int> AssignManifestPackageToGuideAsync(int packagenumber, int ManifestId, string childGuide, Guid user);
        Task<IEnumerable<GuideDetail>> GetGuideByIdAsync(int guideId);
        Task<int> DeleteAirGuideAsync(int Id, int masterId, Guid userId);

    }
}
