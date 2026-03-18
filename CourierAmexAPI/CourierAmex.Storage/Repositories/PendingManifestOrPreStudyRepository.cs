using CourierAmex.Storage.Domain;
using Dapper;

namespace CourierAmex.Storage.Repositories
{
    public class PendingManifestOrPreStudyRepository : IPendingManifestOrPreStudyRepository

    {
        private readonly IDalSession _session;

        public PendingManifestOrPreStudyRepository(IDalSession session)
        {
            _session = session;
        }
        public async Task<IEnumerable<PendingManifestOrPreStudyModel>> Get_Report_PendingManifestOrPreStudy(int companyid, DateTime startDate, DateTime endDate, string reportType)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            if (reportType == "preStudy")
            {
                return await connection.QueryAsync<PendingManifestOrPreStudyModel>("[dbo].[BKO_GetPackagesPendingPrevious]", new
                {
                    EMPRESA_ID = companyid,
                    STARTDATE = startDate,
                    ENDDATE = endDate

                }, null, null, System.Data.CommandType.StoredProcedure);
            }
            else
            {


                return await connection.QueryAsync<PendingManifestOrPreStudyModel>(
                    "[dbo].[BKO_GetPackagesPendingByManifest]",
                    new
                    {

                        COMPANY_ID = companyid,
                        STARTDATE = startDate,
                        ENDDATE = endDate
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );
            }
        }
    }
}