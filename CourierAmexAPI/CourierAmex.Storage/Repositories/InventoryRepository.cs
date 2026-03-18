using Dapper;
using System;
using System.Collections.Generic;
using Dapper;
using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using static Dapper.SqlMapper;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.Data;
using System.Reflection;
using System.Data.Common;


namespace CourierAmex.Storage.Repositories
{
    public class InventoryRepository : IInventoryRepository
    {
        private readonly IDalSession _session;

        public InventoryRepository(IDalSession session)
        {
            _session = session;
        }

        public async Task<IEnumerable<StoreInventoryPackage>> GetStoreInventoryPackagesAsync(int companyId, int storeId)
        {

            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {

                var storeInventoryPackages = await connection.QueryAsync<StoreInventoryPackage>(
                    "[dbo].[USP_GET_STORE_INVENTORY_PACKAGES]",
                    new
                    {
                        CompanyId = companyId,
                        StoreId = storeId
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );


                return storeInventoryPackages;
            }
            catch (Exception ex)
            {
                // Logging the exception or handling error (optional)
                // Log the exception here if needed, or return null as a fallback.
                return null;
            }
        }


        public async Task<int> InsertInventoryPackageAsync(int storeId, int packageNumber, string userName, DateTime date)
        {
            InventoryPackage inventoryPackage = null;
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {
                var result = await connection.ExecuteAsync(
                    "[dbo].[BKO_INSERT_INVENTORY_PACKAGE]",
                    new
                    {
                        StoreId = storeId,
                        PackageNumber = packageNumber,
                        UserName = userName,
                        Date = date
                    },
                    commandType: CommandType.StoredProcedure
                );

                return result;

            }
            catch (Exception ex)
            {
                throw;
            }


        }



        public async Task<int> DeleteInventoryPackageAsync(int storeId, int packageNumber, int deleteAll)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {
                var result = await connection.ExecuteAsync(
                    "[dbo].[BKO_Delete_Inventory_Package]",
                    new
                    {
                        StoreId = storeId,
                        PackageNumber = packageNumber,
                        DeleteAll = deleteAll
                    },
                    commandType: CommandType.StoredProcedure
                );

                return result;
            }
            catch (Exception)
            {
                throw;
            }
        }


        public async Task<int> ResendPackageNotificationAsync(int packageNumber, string documentType)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();

            try
            {
                var result = await connection.ExecuteAsync(
                    "[dbo].[BKO_Resend_Package_Notification]",
                    new
                    {
                        PackageNumber = packageNumber,
                        DocumentType = documentType
                    },
                    commandType: CommandType.StoredProcedure
                );

                return result;
            }
            catch (Exception)
            {
                throw;
            }
        }


        public async Task<IEnumerable<StoreInventory>> GetStoreInventoryAsync(int storeId, string companyId)
        {

            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {

                var res = await connection.QueryAsync<StoreInventory>(
                    "[dbo].[BKO_GET_STORE_INVENTORY_REPORT]",
                    new
                    {
                        CompanyId = companyId,
                        StoreId = storeId
                    },
                    commandType: System.Data.CommandType.StoredProcedure
                );


                return res;
            }
            catch (Exception ex)
            {
                // Logging the exception or handling error (optional)
                // Log the exception here if needed, or return null as a fallback.
                return null;
            }
        }

    }
}
