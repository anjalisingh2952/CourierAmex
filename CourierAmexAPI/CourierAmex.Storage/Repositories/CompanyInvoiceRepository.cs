using Dapper;

using CourierAmex.Storage.Domain;
using CourierAmex.Storage.Enums;
using System.Data;
using System.Collections.Generic;
using System.ComponentModel.Design;
using Newtonsoft.Json.Linq;
using System;

namespace CourierAmex.Storage.Repositories
{
    public class CompanyInvoiceRepository : ICompanyInvoiceRepository
    {
        private readonly IDalSession _session;

        public CompanyInvoiceRepository(IDalSession session)
        {
            _session = session;
        }
        public async Task<IEnumerable<Manifest>> GetManifestAsync(int companyid)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<Manifest>("[dbo].[BKO_INVOICEMANIFESTS]", new
            {
                COMPANYID = companyid
            }, null, null, System.Data.CommandType.StoredProcedure);
        }
        public async Task<int> VerifyPackageNumberAndManifestIdAsync(int manifestid, string packagenumber)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var result = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_VerifyPackageNumberAndManifestId]", new
            {
                MANIFESTID = manifestid,
                PACKAGENUMBER = packagenumber
            }, null, null, System.Data.CommandType.StoredProcedure);

            return result;
        }
        public async Task<CompanyInvoiceData> GetInvoiceDataByCustomerAsync(string clientid, string packagenumber)
        {
            CompanyInvoiceData result = new CompanyInvoiceData();
            var connection = await _session.GetReadOnlyConnectionAsync();
            using (var multi = await connection.QueryMultipleAsync("[dbo].[BKO_PACKAGES_CUSTOMER]", new
            {
                CLIENTID = clientid,
                PACKAGENUMBER = packagenumber
            }, commandType: CommandType.StoredProcedure))
            {
                result.CustomerInfo = (List<CustomerInfo>)await multi.ReadAsync<CustomerInfo>();
                result.PackageInfo = (List<PackageInfo>)await multi.ReadAsync<PackageInfo>();
                result.PackageSummary = await multi.ReadFirstAsync<PackageInvoiceSummary>();
            }
            return result;
        }
        public async Task<CompanyInvoiceData> GetInvoiceDataByManifestAsync(int manifestid, string packagenumber)
        {
            CompanyInvoiceData result = new CompanyInvoiceData();
            try
            {
                var connection = await _session.GetReadOnlyConnectionAsync();
                using (var multi = await connection.QueryMultipleAsync("[dbo].[BKO_PACKAGES_MANIFEST]", new
                {
                    MANIFESTID = manifestid,
                    PACKAGENUMBER = packagenumber
                }, commandType: CommandType.StoredProcedure))
                {
                    result.CustomerInfo = (List<CustomerInfo>)await multi.ReadAsync<CustomerInfo>();
                    result.PackageInfo = (List<PackageInfo>)await multi.ReadAsync<PackageInfo>();
                    result.PackageSummary = await multi.ReadFirstAsync<PackageInvoiceSummary>();
                }
                return result;
            }
            catch (Exception ex)
            {
                return result;
            }



        }
        public async Task<int?> CreateInvoiceHeader(ComapnyInvoiceHeader entity)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {
                var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_INSERT_INVOICEHEADER]", new
                {
                    COMPANYID = entity.CompanyId,
                    USER = entity.User,
                    CUSTOMER = entity.Customer,
                    DATE = entity.Date,
                    TAXAMOUNT = entity.TaxAmount,
                    EXEMPTAMOUNT = entity.ExemptAmount,
                    CUSTOMSTAX = entity.CustomsTax,
                    SALESTAX = entity.SalesTax,
                    SUBTOTAL = entity.SubTotal,
                    DISCOUNT = entity.Discount,
                    TOTAL = entity.Total,
                    TOTALLOCAL = entity.TotalLocal,
                    NOTE = entity.Note
                }, null, null, System.Data.CommandType.StoredProcedure);

                return newId;
            }
            catch (Exception)
            {
                return 0;
            }

        }
        public async Task<int?> CreateInvoiceDetail(CompanyInvoiceDetail entity)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_INSERT_INVOICEDETAIL]", new
            {
                COMPANYID = entity.CompanyId,
                INVOICENUMBER = entity.InvoiceNumber,
                PRODUCTID = entity.ProductId,
                QUANTITY = entity.Quantity,
                PRICE = entity.Price,
                CUSTOMSTAX = entity.CustomsTax,
                SALESTAX = entity.SalesTax,
                TAXABLEAMOUNT = entity.TaxableAmount,
                EXEMPTAMOUNT = entity.ExemptAmount,
                SUBTOTAL = entity.Subtotal,
                DISCOUNT = entity.Discount,
                TOTAL = entity.Total
            }, null, null, System.Data.CommandType.StoredProcedure);

            return newId;
        }
        public async Task<int?> UpdateInvoiceStatus(string packagenumbers)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_UPDATE_INVOICESTATUS]", new
            {
                packagenumbers = packagenumbers
            }, null, null, System.Data.CommandType.StoredProcedure);

            return newId;
        }
        public async Task<int?> GetNewInvoiceNumber()
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_GetNewInvoiceNumber]", null, null, null, System.Data.CommandType.StoredProcedure);
            return newId;
        }
        public async Task<IEnumerable<InvoiceArticle>> GetInvoiceArticlesJamaicaAsync(string zone, float weight, float value, float volume, int shippingType, int package)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<InvoiceArticle>("[dbo].[BKO_INVOICEARTICLESJAMAICA]", new
            {
                ZONA = zone,
                PESO = weight,
                VALOR = value,
                VOLUMEN = volume,
                TIPOENVIO = shippingType,
                PAQUETE = package
            }, null, null, System.Data.CommandType.StoredProcedure);
        }
        public async Task<IEnumerable<InvoiceArticle>> GetInvoiceArticlesAsync(string customer, int type, float weight, float volume, int shippingType, string packages, Boolean transportation = true, Boolean delivery = true)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<InvoiceArticle>("[dbo].[BKO_INVOICEARTICLES]", new
            {
                CUSTOMER = customer,
                TYPE = 1,
                WEIGHT = weight,
                VOLUME = volume,
                SHIPPINGTYPE = shippingType,
                TRANSPORTATION = transportation,
                DELIVERY = delivery,
                PACKAGENUMBERS = packages

            }, null, null, System.Data.CommandType.StoredProcedure);
        }
        public async Task<ElectronicInvoice?> GetElectronicInvoiceInformationAsync(string customerCode)
        {
            try
            {
                var connection = await _session.GetReadOnlyConnectionAsync();
                return await connection.QuerySingleOrDefaultAsync<ElectronicInvoice>("[dbo].[BKO_SELECT_ELECTRONIC_INVOICE_CLIENT]", new
                {
                    CLIENTCODE = customerCode
                }, null, null, System.Data.CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                throw;
            }

        }
        public async Task<int?> SaveElectronicInvoiceInformationAsync(InsertElectronicInvoice entity)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {
                var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_INSERT_ELECTRONIC_INVOICE]", new
                {
                    INVOICEDATE = entity.Date,
                    INVOICENUMBER = entity.InvoiceNumber,
                    COMPANYID = entity.CompanyId,
                    PAYMENTTYPE = entity.PaymentType,
                    TAXDETAILLINECODE = entity.TaxDetailLineCode,
                    SALECONDITION = entity.SaleCondition
                }, null, null, System.Data.CommandType.StoredProcedure);

                return newId;
            }
            catch (Exception)
            {
                return 0;
            }

        }
        public async Task<int?> SaveMiamiInvoiceAsync(InsertMiamiInvoice entity)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {
                var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_INSERT_PACKETREFERENCE]", new
                {
                    COMPANYID = entity.CompanyId,
                    PACKAGENUMBER = entity.PackageNumber,
                    USER = entity.User,
                    REFERENCENUMBER = entity.ReferenceNumber,
                    TOTAL = entity.Total
                }, null, null, System.Data.CommandType.StoredProcedure);

                return newId;
            }
            catch (Exception)
            {
                return 0;
            }

        }
        public async Task<int?> ManifestInvoiceAsync(ManifestInvoice entity)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            try
            {
                var newId = await connection.QuerySingleOrDefaultAsync<int>("[dbo].[BKO_INVOICE_MANIFNEST]", new
                {
                    @MANIFESTNUMBER = entity.ManifestNumber
                }, null, null, System.Data.CommandType.StoredProcedure);

                return newId;
            }
            catch (Exception)
            {
                return 0;
            }

        }
        public async Task<CompanyExchangeRate> GetCompanyExchangeRateAsync(int CompanyId, int InvoiceNumber)
        {
            try
            {
                var connection = await _session.GetReadOnlyConnectionAsync();
                return await connection.QuerySingleOrDefaultAsync<CompanyExchangeRate>("[dbo].[BKO_GetExchangeRate]", new
                {
                    COMPANYID = CompanyId,
                    INVOICEID = InvoiceNumber
                }, null, null, System.Data.CommandType.StoredProcedure);
            }
            catch (Exception ex)
            {
                throw;
            }
        }

        public async Task<IEnumerable<SalesSummaryReport>> GetSalesSummaryAsync(string startDate, string endDate, string customerCode)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<SalesSummaryReport>("[dbo].[BKO_SALES_REPORT_DETAIL_SUMMARY]", new
            {
                STARTDATE = startDate,
                ENDDATE = endDate,
                CUSTOMERCODE = customerCode
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        #region REPORT

        public async Task<IEnumerable<InvoiceCreditPending>> Get_Report_OutstandingCreditCustomerInvoices(int companyid, DateTime startDate, DateTime endDate, string zoneIds)
        {
            var connection = await _session.GetReadOnlyConnectionAsync();
            return await connection.QueryAsync<InvoiceCreditPending>("[dbo].[BKO_REPORT_OUTSTANDINGCREDITCUSTOMERINVOICES]", new
            {
                COMPANYID = companyid,
                STARTDATE = startDate,
                ENDDATE = endDate,
                ZONE = zoneIds
            }, null, null, System.Data.CommandType.StoredProcedure);
        }

        #endregion
    }
}
