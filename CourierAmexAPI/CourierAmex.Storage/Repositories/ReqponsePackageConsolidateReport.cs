using CourierAmex.Storage.Domain;

namespace CourierAmex.Storage.Repositories
{
    public class ResponsePackageConsolidateReport
    {
        public List<PackagingConsolidatedReport> mainData { get; set; }

        public ManifestReport_GeneralInfo? GeneralInfo { get; set; }

    }
}