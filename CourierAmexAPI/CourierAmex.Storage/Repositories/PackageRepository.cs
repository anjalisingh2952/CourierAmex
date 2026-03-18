using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using static Dapper.SqlMapper;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Data;
using System.Reflection;

namespace CourierAmex.Storage.Repositories
{
    public class PackageRepository : IPackageRepository
    {
        private readonly IDalSession _session;

        public PackageRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<Package?> GetByIdAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            using var multi = await connection.QueryMultipleAsync("[dbo].[BKO_Package_GetById]", new
            {
                inId = id
            }, null, null, System.Data.CommandType.StoredProcedure);

            var entity = await multi.ReadSingleOrDefaultAsync<Package>();
            return entity;
        }

        public async Task<Package?> GetByPackageNumberAsync(int companyId = 0, int packageNumber = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            using var multi = await connection.QueryMultipleAsync("[dbo].[BKO_Package_GetByPackageNumber]", new
            {
                companyId = companyId,
                packageNumber = packageNumber
            }, null, null, System.Data.CommandType.StoredProcedure);

            var entity = await multi.ReadSingleOrDefaultAsync<Package>();
            return entity;
        }

        public async Task<IEnumerable<Package>> GetPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0, int stateId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Package>("[dbo].[BKO_Package_GetPaged]", new
            {
                inCompanyId = companyId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy,
                inStateId = stateId
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<PackageEvent>> GetEventsPagedAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<PackageEvent>("[dbo].[BKO_GetPackageEvents]", new
            {
                inCompanyId = companyId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Package>> GetPagedByManifestAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0, int manifestId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Package>("[dbo].[BKO_Package_GetByManifest]", new
            {
                inCompanyId = companyId,
                inManifestId = manifestId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Package>> GetPagedPriceByManifestAsync(int pageSize, short pageIndex, string orderBy = "", string filterBy = "", int companyId = 0, int manifestId = 0)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Package>("[dbo].[BKO_PackagePrice_GetByManifest]", new
            {
                inCompanyId = companyId,
                inManifestId = manifestId,
                inPageSize = pageSize,
                inPageIndex = pageIndex,
                inSortBy = orderBy,
                inFilterBy = filterBy
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<Package>> GetByManifestAirGuideAsync(int companyId = 0, int manifestId = 0, string airGuide = "")
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Package>("[dbo].[BKO_Package_GetByManifestAirGuide]", new
            {
                inCompanyId = companyId,
                inManifestId = manifestId,
                inAirGuide = airGuide
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<PackageCategory?> CategoryUpdateAsync(PackageCategory entity, Guid userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_PackageCategory_Update]", new
            {
                inCompanyId = entity.CompanyId,
                inNumber = entity.Number,
                inCategory = entity.Category,
                inUserId = userId
            }, null, null, System.Data.CommandType.StoredProcedure);

            return entity;
        }

        public async Task<Package?> CreateOrUpdateAsync(Package entity, Guid userId)
        {
            int? id = entity.Id > 0 ? entity.Id : null;
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_Package_CreateOrUpdate]", new
            {
                inId = id,
                inCompanyId = entity.CompanyId,
                inNumber = entity.Number,
                inCustomerCode = entity.CustomerCode,
                inTrackingNumber = entity.TrackingNumber,
                inCourierName = entity.CourierName,
                inOrigin = entity.Origin,
                inObservations = entity.Observations,
                inInsurance = entity.Insurance,
                inPackages = entity.Packages,
                inPackageStateId = entity.PackageStateId,
                inDescription = entity.Description,
                inWeight = entity.Weight,
                inPrice = entity.Price,
                inWidth = entity.Width,
                inHeight = entity.Height,
                inLong = entity.Long,
                inVolumetricWeight = entity.VolumetricWeight,
                inReceivedBy = entity.ReceivedBy,
                inPackageType = entity.PackageType,
                inPalets = entity.Palets,
                inBags = entity.Bags,
                inTotalWeight = entity.TotalWeight,
                inType = entity.Type,
                inTotalLabel = entity.TotalLabel,
                inPackageDetail = entity.PackageDetail,
                inSearchCustomer = entity.SearchCustomer,
                inUpdatePrice = entity.UpdatePrice,
                inHasInvoice = entity.HasInvoice,
                inPreStudy = entity.PreStudy,
                inDua = entity.Dua,
                inCommodityId = entity.CommodityId,
                inResources = entity.Resources,
                inCategory = entity.Category,
                inTaxType = entity.TaxType,
                inStatus = (byte)entity.Status,
                inUserId = userId
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (int.TryParse(newId.ToString(), out int idOutput) && entity.Status != BaseEntityStatus.Deleted)
            {
                entity.Id = idOutput;
            }

            return entity;
        }

        public async Task<IEnumerable<Package>> ValidateNumberAsync(int id, int number)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Package>("[dbo].[BKO_Package_ValidateNumber]", new
            {
                inId = id,
                inNumber = number
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<int> ValidateDeleteAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<long>("[dbo].[BKO_Package_ValidateDelete]", new
            {
                inId = id,
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (int.TryParse(newId.ToString(), out int idOutput))
            {
                id = idOutput;
            }

            return id;
        }

        public async Task<ClassifyPackage?> ClassifyPackageAsync(ClassifyPackage entity, Guid userId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_PackageClassify]", new
            {
                inNumber = entity.Id,
                inShipType = entity.ShipTypeId,
                inIssueTypeId = entity.IssueTypeId,
                inManifestId = entity.ManifestId,
                inUserId = userId
            }, null, null, System.Data.CommandType.StoredProcedure);

            if (int.TryParse(newId.ToString(), out int idOutput))
            {
                entity.Id = idOutput;
            }

            return entity;
        }

        public async Task<PackageDetail> GetPackageDetailByManifestId(long manifestId)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            var packageDetail = await connection.QuerySingleOrDefaultAsync<PackageDetail>(
                "[dbo].[BKO_GetManifestPackageDetails]",
                new { ManifestID = manifestId },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return packageDetail;
        }

        public async Task<PackageDetail> GetPackageDetailByManifestIdAndAirGuideIdAsync(string airGuideId, int manifestId)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var manifest = await connection.QuerySingleOrDefaultAsync<PackageDetail>(
                "[dbo].[BKO_GetPackageDetails_ByAirGuide]",
            new
            {
                ManifestId = manifestId,
                AirGuideId = airGuideId
            }, null, null, System.Data.CommandType.StoredProcedure
            );

            return manifest;
        }

        public async Task<IEnumerable<PackagedPackage>> GetPackagedPackages(string airGuideId, int manifestId, int packed)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var manifest = await connection.QueryAsync<PackagedPackage>(
                "[dbo].[BKO_GetPackagedPackages]",
                new
                {
                    AIRGUIDE = airGuideId,
                    MANIFESTID = manifestId,
                    PACKED = packed
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return manifest;
        }

        public async Task<PackagedPackagedResponse> GetPackedPackages(string? category, string? airGuideId, int manifestId, int packed, int? pallet)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            using var multi = await connection.QueryMultipleAsync(
                "[dbo].[BKO_GetPackedPackages]",
                new
                {
                    AIRGUIDE = airGuideId,
                    MANIFESTID = manifestId,
                    PACKED = packed,
                    CATEGORY = category,
                    PALET = pallet
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            var packagedPackages = (await multi.ReadAsync<PackagedPackage>()).ToList();
            var packageDetails = await multi.ReadFirstOrDefaultAsync<RegisterBagPackagingRequest>();


            return new PackagedPackagedResponse
            {
                PackagedPackages = packagedPackages,
                PackageDetails = packageDetails
            };
        }

        public async Task<IEnumerable<PackagedPackage>> GetAirGuideManifest(int manifestId)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var manifest = await connection.QueryAsync<PackagedPackage>(
                "[dbo].[BKO_GetAirGuideManifest]",
                new
                {
                    MANIFESTID = manifestId,
                },
                commandType: System.Data.CommandType.StoredProcedure
            );

            return manifest;
        }

        public async Task<string> PackagePriceUpdateBulkAsync(List<PackagePrice> priceData)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            DataTable table = ConvertToDataTable(priceData);

            try
            {
                await connection.ExecuteAsync("[dbo].[usp_UpdatePaquetePrecio_Bulk]", new
                {
                    pricedata = table.AsTableValuedParameter("dbo.utt_UpdatePaquetePrecio")
                }, commandType: System.Data.CommandType.StoredProcedure);

                return "success";
            }
            catch (global::System.Exception)
            {
                return "failed";
            }


        }

        public async Task<string> PackagePriceUpdateAsync(PackagePrice priceData)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            try
            {
                await connection.ExecuteAsync("[dbo].[BKO_UpdatePackagePrice]", new
                {
                    Number = priceData.PackageNumber,
                    Price = priceData.Price,
                    Description = priceData.Description,
                    IsPermission = priceData.IsPermission,
                    IsDocument = priceData.IsDocument
                }, commandType: System.Data.CommandType.StoredProcedure);

                return "success";
            }
            catch (global::System.Exception)
            {
                return "failed";
            }


        }

        public static DataTable ConvertToDataTable<T>(List<T> list)
        {
            DataTable dataTable = new DataTable(typeof(T).Name);

            if (list == null || list.Count == 0)
                return dataTable;

            PropertyInfo[] properties = typeof(T).GetProperties();

            foreach (PropertyInfo prop in properties)
            {
                dataTable.Columns.Add(prop.Name, Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType);
            }

            foreach (T item in list)
            {
                DataRow row = dataTable.NewRow();
                foreach (PropertyInfo prop in properties)
                {
                    row[prop.Name] = prop.GetValue(item) ?? DBNull.Value;
                }
                dataTable.Rows.Add(row);
            }

            return dataTable;
        }



        public async Task RegisterBagPackagingAsync(int manifestId, string bag, int taxType, decimal width, decimal height, decimal length, decimal actualVolumeWeight, decimal actualWeight, decimal systemVolumeWeight, decimal systemWeight, int packages, string packagingType, int sequence, string category, string user, int? isConsolidated, int? pallet)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {
                await connection.QuerySingleOrDefaultAsync("[dbo].[BKO_RegisterBagPackaging]", new
                {
                    MANIFEST_ID = manifestId,
                    BAG = bag,
                    TAX_TYPE = taxType,
                    WIDTH = width,
                    HEIGHT = height,
                    LENGTH = length,
                    ACTUAL_VOLUME_WEIGHT = actualVolumeWeight,
                    ACTUAL_WEIGHT = actualWeight,
                    SYSTEM_VOLUME_WEIGHT = systemVolumeWeight,
                    SYSTEM_WEIGHT = systemWeight,
                    PACKAGES = packages,
                    PACKAGING_TYPE = packagingType,
                    SEQUENCE = sequence,
                    CATEGORY = category,
                    USER = user,
                    ISCONSOLIDATED = isConsolidated,
                    PALET = pallet ?? 1
                }, null, null, System.Data.CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        public async Task<string> GetNextConsecutivoAsync(string packagingType, int length)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var parameters = new DynamicParameters();
            parameters.Add("@TIPO_EMPAQUE", packagingType);
            parameters.Add("@LARGO", length);
            parameters.Add("@CONSECUTIVO", dbType: DbType.String, direction: ParameterDirection.Output, size: 20);

            await connection.ExecuteAsync(
                "[dbo].[BKO_GetNextConsecutivePackaging]",
                parameters,
                commandType: CommandType.StoredProcedure
            );
            return parameters.Get<string>("@CONSECUTIVO");
        }

        public async Task<int> PackPackageAsync(int? packageNumber, string? bagNumber, int? palet, string? manifestNumber, int? packageSubType, string? user)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {

                var packResponse = await connection.QuerySingleAsync<int>("[dbo].[BKO_PackPackage]", new
                {
                    NUMERO_PAQUETE = packageNumber,
                    NUMERO_BOLSA = bagNumber,
                    PALET = palet,
                    NUMERO_MANIFIESTO = manifestNumber,
                    SUBTIPOPAQUETE = packageSubType,
                    USUARIO = user
                }, commandType: System.Data.CommandType.StoredProcedure);

                return packResponse;
            }
            catch (Exception ex)
            {
                return 1;
            }
        }

        public async Task<int> PackPackageGuideAsync(int? packageNumber, string? bagNumber, int? palet, string? manifestNumber, int? packageSubType, string? user)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {

                var packResponse = await connection.QuerySingleAsync<int>("[dbo].[BKO_PackPackageGuide]", new
                {
                    NUMERO_PAQUETE = packageNumber,
                    NUMERO_BOLSA = bagNumber,
                    PALET = palet,
                    NUMERO_MANIFIESTO = manifestNumber,
                    SUBTIPOPAQUETE = packageSubType,
                    USUARIO = user
                }, commandType: System.Data.CommandType.StoredProcedure);

                return packResponse;
            }
            catch (Exception ex)
            {
                return 1;
            }
        }

        public async Task UnpackPackageAsync(int? packageNumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            await connection.ExecuteAsync("[dbo].[BKO_UnpackPackage]", new
            {
                NUMERO_PAQUETE = packageNumber,

            }, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task UnpackPackageConsolidatedAsync(int? packageNumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            await connection.ExecuteAsync("[dbo].[BKO_UnpackPackageConsolidated]", new
            {
                NUMERO_PAQUETE = packageNumber,

            }, commandType: System.Data.CommandType.StoredProcedure);
        }

        public async Task<IEnumerable<ManifestPackage>?> GetManifestPackageAsync(string manifestNumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {

                var packResponse = await connection.QueryAsync<ManifestPackage>("[dbo].[BKO_GetManifestPackages]", new
                {
                    MANIFESTNUMBER = manifestNumber
                }, commandType: System.Data.CommandType.StoredProcedure);

                return packResponse;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<int> UnassignPackageAsync(int packageId, int manifestId, int initialStateId, string modifiedBy, bool forceRemove)
        {
            try
            {
                var connection = await _session.GetReadOnlyConnectionAsync();

                var result = await connection.ExecuteAsync(
                    "[dbo].[BKO_UnmanifestPackage]",
                    new
                    {
                        PACKAGE_ID = packageId,
                        MANIFEST_ID = manifestId,
                        MODIFIED_BY = modifiedBy,
                        FORCE_REMOVE = forceRemove
                    },
                    commandType: CommandType.StoredProcedure
                );


                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in UnassignPackageAsync: " + ex.Message);
                return -1;
            }
        }


        public async Task<IEnumerable<Package>> SearchPackageAsync(int packageNumber = 0, string courierNumber = "", string customerAccount = "")
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            return await connection.QueryAsync<Package>("[dbo].[BKO_Package_SearchPackage]", new
            {
                packageNumber = packageNumber,
                courierNumber = courierNumber,
                customerAccount = customerAccount
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        public async Task<Package?> GetPackageForCustomerServiceAsync(int id)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            using var multi = await connection.QueryMultipleAsync(
                "[dbo].[BKO_GetPackageFromCustomerService]",
                new { inId = id },
                commandType: System.Data.CommandType.StoredProcedure);

            var entity = await multi.ReadSingleOrDefaultAsync<Package>();
            return entity;
        }

        public async Task<List<PackageInvoiceStatus>?> GetPackagesByInvoiceStatusAsync(GetPackageByInvoiceStatusRequest request)
        {
            try
            {
                using var connection = await _session.GetReadOnlyConnectionAsync();

                var result = await connection.QueryAsync<PackageInvoiceStatus>(
                    "[dbo].[BKO_GetPackageByInvoiceStatus]",
                    new
                    {
                        SearchBy = request.SearchBy,
                        CompanyId = request.CompanyId
                    },
                    commandType: CommandType.StoredProcedure
                );

                return result.ToList();
            }
            catch (Exception ex)
            {
                throw;
            }
        }



        public async Task<int> UpdatePackageInvoiceStatusAsync(UpdatePackageInvoiceStatusRequest request)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.ExecuteAsync(
                "[dbo].[BKO_UpdatePackageInvoiceStatus]",
                new
                {
                    PackageId = request.PackageId,
                    HasInvoice = request.HasInvoice,
                    CompanyId = request.CompanyId
                },
                commandType: CommandType.StoredProcedure
            );

            return result;
        }


        public async Task<string> UpdatePackageCommodityAndPriceAsync(UpdatePackageCommodityPriceModel packageData)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            try
            {
               
                await connection.ExecuteAsync("[dbo].[BKO_UpdatePackageCommodityAndPrice]", new
                {
                    PackageNumber = packageData.PackageNumber,
                    ModifiedBy = packageData.ModifiedBy,
                    Price = packageData.Price,
                    CommodityId = packageData.CommodityId
                }, commandType: System.Data.CommandType.StoredProcedure);

                return "success"; 
            }
            catch (global::System.Exception ex)
            {
               
                return $"failed: {ex.Message}";
            }
        }

        public async Task<List<PendingBillingPackageModel>> GetPendingBillingPackagesAsync(int companyId)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<PendingBillingPackageModel>(
                "[dbo].[BKO_GetPendingBillingPackages]",
                new { CompanyId = companyId },
                commandType: CommandType.StoredProcedure);

            return result.ToList();
        }


        public async Task<List<Commodities>> GetCommoditiesAsync(int companyId)
        {
            using var connection = await _session.GetReadOnlyConnectionAsync();

            var result = await connection.QueryAsync<Commodities>(
                "[dbo].[BKO_GetCommodities]",
                new { inCompanyId = companyId },
                commandType: CommandType.StoredProcedure);

            return result.ToList();
        }







    }
}
