using CourierAmex.Models;

namespace CourierAmex.Services
{
    public interface IAirGuideService
    {
        Task<IEnumerable<AirGuideModel>> GetAirGuidesByIdAsync(int manifestId, int companyId);
        Task<IEnumerable<AirGuideModel>> GetAirGuideByManifestIdAsync(int manifestId);
        Task<IEnumerable<MasterGuideModel>> GetMasterGuide(int manifestId);
        Task<IEnumerable<PackageCategoryModel>> GetPackagesByAirGuideByManifestId(int manifestId, string guideNumber, int companyId = 0);
        Task<int> CreateOrUpdateMasterGuide(MasterGuideModel model);
        Task<int> CreateOrUpdateChildGuide(ChildGuideModel model);
        Task<IEnumerable<GuideDetailModel>> GetGuideById(int guideId);
        Task<int> DeleteAirGuide(int Id, int masterId, Guid userId);
        Task<int> AssignManifestPackageToGuide(int packagenumber, int ManifestId, string childGuide, Guid user);
    }
}
