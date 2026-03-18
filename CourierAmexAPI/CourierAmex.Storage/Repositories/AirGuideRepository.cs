using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using System.Data;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System;

namespace CourierAmex.Storage.Repositories
{
    public class AirGuideRepository: IAirGuideRepository
    {
        private readonly IDalSession _session;

        public AirGuideRepository(IDalSession session)
        {
            _session = session;
        }


        public async Task<IEnumerable<AirGuide>> GetAirGuidesByIdAsync(long manifestId, int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            return await connection.QueryAsync<AirGuide>("[dbo].[BKO_Manifest_GetAirGuides]", new
            {
                inCompanyId = companyId,
                inId = manifestId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<MasterGuide>> GetMasterGuideAsync(long manifestId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            return await connection.QueryAsync<MasterGuide>("[dbo].[BKO_GetMasterGuide]", new
            {
                ManifestId = manifestId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<AirGuide>> GetAirGuideByManifestIdAsync(int manifestId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            return await connection.QueryAsync<AirGuide>("[dbo].[BKO_AirGuide_GetByManifest]", new
            {
                inMasterGuideID = manifestId
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

        public async Task<IEnumerable<GuideDetail>> GetGuideByIdAsync(int guideId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            return await connection.QueryAsync<GuideDetail>("[dbo].[BKO_AirGuide_GetById]", new
            {
                inId = guideId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PackageCategory>> GetPackagesByAirGuideByManifestId(int manifestId, string guideNumber, int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            return await connection.QueryAsync<PackageCategory>("[dbo].[BKO_Package_GetByManifestAirGuide]", new
            {
                inCompanyId = companyId,
                inManifestId = manifestId,
                inAirGuide = guideNumber
            }, null, null, System.Data.CommandType.StoredProcedure);

        }

        public async Task<int> CreateOrUpdateMasterGuideAsync(MasterGuide model)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_MasterGuide_CreateOrUpdate]", new
            {
                inId = model.Id ?? (object)DBNull.Value,
                inManifestId = model.ManifestId,
                inShipper = model.Shipper,
                inAirWayBill = model.AirWayBill,
                inIssuingCarrierName = model.IssuingCarrierName,
                inIssuingCarrierCity = model.IssuingCarrierCity,
                inAirPortDeparture = model.AirPortDeparture,
                inTo = model.To,
                inAirPortDestination = model.AirPortDestination,
                inFirstCarrier = model.FirstCarrier,
                inFlightDate = model.FlightDate,
                inAccountingInformation = model.AccountingInformation,
                inPlace = model.Place,
                inSignature = model.Signature,
                inUserId = model.UserId
            }, commandType: System.Data.CommandType.StoredProcedure);

            return result;
        }

        public async Task<int> CreateOrUpdateChildGuideAsync(ChildGuide model)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_ChildGuide_CreateOrUpdate]", new
            {
                GUIAHIJA_ID = model.ChildGuideId ?? (object)DBNull.Value,
                GUIAMADRE_ID = model.ParentGuideId ?? (object)DBNull.Value,
                TIPO = model.Type,
                CONSECUTIVO = model.Consecutive,
                GUIAHIJA = model.ChildGuideCode,
                CONSIGNEE = model.Consignee,
                CONTACT = model.Contact,
                NOMBRE = model.Name,
                TIPO_IDENTIFICACION = model.IdentificationType,
                IDENTIFICACION = model.Identification,
                ESTADO = model.Status,
                USUARIO = model.User
            }, commandType: System.Data.CommandType.StoredProcedure);

            return result;
        }

        public async Task<int> DeleteAirGuideAsync(int Id,int masterId,Guid userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_AirGuide_Delete]", new
            {
                inId = Id,
                inMasterGuideId= masterId,
                inUserId = userId
            }, commandType: System.Data.CommandType.StoredProcedure); 

            return result;
        }

        public async Task<int> AssignManifestPackageToGuideAsync(int packagenumber, int ManifestId, string childGuide,Guid user)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_AssignManifestPackageToGuide]", new
            {
                NUMERO = packagenumber,
                ID_MANIFIESTO = ManifestId,
                GUIA = childGuide,
                MODIFICO = user
            }, commandType: System.Data.CommandType.StoredProcedure);

            return result;
        }
    }
}
