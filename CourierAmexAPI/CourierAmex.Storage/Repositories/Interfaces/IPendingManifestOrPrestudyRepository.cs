using CourierAmex.Storage.Domain;


namespace CourierAmex.Storage.Repositories
{
    public interface IPendingManifestOrPreStudyRepository
    {
        Task<IEnumerable<PendingManifestOrPreStudyModel>> Get_Report_PendingManifestOrPreStudy(int companyid, DateTime startDate, DateTime endDate, string reportType);
    }
}