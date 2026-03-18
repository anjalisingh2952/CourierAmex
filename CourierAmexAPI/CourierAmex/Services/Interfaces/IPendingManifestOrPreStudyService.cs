using CourierAmex.Models;
using CourierAmex.Storage.Domain;

namespace CourierAmex.Services
{
    public interface IPendingManifestOrPreStudyService
    {
        Task<GenericResponse<List<PendingManifestOrPreStudyModel>>> Get_PendingManifestOrPreStudyAsync(int companyid, DateTime startDate, DateTime endDate, string reportType);
    }
}