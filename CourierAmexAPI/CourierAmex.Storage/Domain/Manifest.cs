namespace CourierAmex.Storage.Domain
{
    // TABLE: ENM_ENCABEZADO_MANIFIESTO
    public class Manifest : BaseEntity<long>
    {
        // CompanyId
        public required int CompanyId { get; set; }
        // NUMERO
        public required string ManifestNumber { get; set; }
        // DIRECCION
        public required string Address { get; set; }
        // FECHA
        public required DateTime ManifestDate { get; set; }
        // LISTO
        public required byte Ready { get; set; }
        // PAIS
        public required string CountryCode { get; set; }
        // FACTURADO
        public required byte Invoiced { get; set; }
        // CERRADO
        public required int Closed { get; set; }
        // SINCRONIZADO
        public required int Synchronized { get; set; }
        // NOMBRE
        public required string Name { get; set; }
        // TIPO
        public required string Type { get; set; }
        // TIPOMANIFIESTO
        public required int ShipType { get; set; }
        // FORMAENVIO
        public required int ShippingWay { get; set; }
        // ESTADOFACTURA
        public required int InvoiceStatus { get; set; }
        // FACTURACIONAUTOMATICA
        public required int AutomaticBilling { get; set; }

        public string? CompanyName { get; set; }
        public string? ShippingWayName { get; set; }
    }

    public class ManifestScanner
    {
        public string ManifestNumber { get; set; }
        public DateTime ManifestDate { get; set; }
        public int Id { get; set; }
        public int Packages { get; set; }
        public int TotalRows { get; set; }
    }

    public class CountManifestScanner
    {
        public int Total { get; set; }
        public int Pending { get; set; }
        public int Normal { get; set; }
        public int Customs { get; set; }
    }

    public class PendingPackageInfo
    {
        public string PackageNumber { get; set; }
        public string CustomerAccount { get; set; }
        public string CustomerName { get; set; }
        public string Origin { get; set; }
        public string Description { get; set; }
        public string Bag { get; set; }
        public int TotalRows { get; set; }
    }

    public class ScannedPackageInfo
    {
        public string Client { get; set; }
        public string FullName { get; set; }
        public string Description { get; set; }
        public int Weight { get; set; }
        public int Volume { get; set; }
        public string Zone { get; set; }
        public int Route { get; set; }
        public int ManifestId { get; set; }
        public string ManifestNumber { get; set; }
        public string ManifestCountry { get; set; }
        public int PackageNumber { get; set; }
        public int ManifestDetailId { get; set; }
        public int PackageId { get; set; }
        public string PackageCountry { get; set; }
        public string Area { get; set; }
        public string Countryname { get; set; }
        public string TotalLabel { get; set; }
        public int Shipment { get; set; }
        public string Bag { get; set; }
        public int EstId { get; set; }
        public int Type { get; set; }
        public int PackageCompanyId { get; set; }
    }

    public class PackageReassign
    {
        public int PackageNumber { get; set; }
        public int ManifestId { get; set; }
        public string BagNumber { get; set; }
        public string Modifiedby { get; set; }
    }

    public class BagInfo
    {
        public int Total { get; set; }
        public int Normal { get; set; }
        public int Customs { get; set; }
        public int Pending { get; set; }
        public string Bag { get; set; }
    }

    public class ManifestReport_GeneralInfo
    {
        public int Id { get; set; }
        public string ManifestNumber { get; set; }
        public string Country { get; set; }
        public DateTime Date { get; set; }
        public string Address { get; set; }
        public DateTime CurrentDate { get; set; } = DateTime.Now; // Default to current date
    }

    public class ManifestReport_BillingInfo
    {
        public string ChildGuide { get; set; }  // GUIA_HIJA
        public string CustomerName { get; set; }  // CUSTOMER_NAME
        public string PackageNumbers { get; set; }  // PACKAGE_NUMBERS (Concatenated)
        public decimal Weight { get; set; }  // TOTAL_WEIGHT
        public decimal VolumeWeight { get; set; }  // TOTAL_VOLUME_WEIGHT
        public string ProviderName { get; set; }  // PROVIDER_NAME
        public string Classification { get; set; }  // CLASSIFICATION
        public string Address { get; set; }  // ADDRESS
        public string Email { get; set; }  // EMAIL
        public string Phone { get; set; }  // PHONE
        public string Bag { get; set; }  // BAG
        public int TotalPieces { get; set; }  // TOTAL_PIECES
        public string Category { get; set; }  // CATEGORY
        public decimal CubicFeet { get; set; }  // TOTAL_CUBIC_FEET
        public bool CustomerPickup { get; set; }  // CUSTOMER_PICKUP
        public string Origin { get; set; }
        public string Courier { get; set; }
        public string CourierNumber { get; set; }
        public string Description { get; set; }
    }

    public class ManifestReport_BagInfo
    {
        public string ChildGuide { get; set; }         // GUIA_HIJA
        public string CustomerName { get; set; }       // CUSTOMER_NAME
        public string PackageNumbers { get; set; }     // PACKAGE_NUMBERS
        public decimal Weight { get; set; }            // WEIGHT
        public decimal VolumeWeight { get; set; }      // VOLUME_WEIGHT
        public string ProviderName { get; set; }       // PROVIDER_NAME
        public string Classification { get; set; }     // CLASSIFICATION
        public string Address { get; set; }            // ADDRESS
        public string Email { get; set; }              // EMAIL
        public string Phone { get; set; }              // PHONE
        public string Bag { get; set; }                // BAG
        public int Pieces { get; set; }                // PIECES
        public string Category { get; set; }           // CATEGORY
        public decimal CubicFeet { get; set; }         // CUBIC_FEET
        public bool CustomerPickup { get; set; }       // CUSTOMER_PICKUP
        public string Origin { get; set; }             // ORIGIN
        public string Courier { get; set; }            // COURIER
        public string CourierName { get; set; }      // COURIER_NUMBER
        public string Description { get; set; }        // DESCRIPTION
    }
  


    public class ManifestPreAlert
    {
        public string Gateway { get; set; }
        public string Account { get; set; }
        public string AIPE { get; set; }
        public int CRTRACK { get; set; }
        public string CourierCode { get; set; }
        public string Description { get; set; }
        public string Shipper { get; set; }
        public string Consignee { get; set; }
        public string Company { get; set; }
        public string Identification { get; set; }
        public string TypeId { get; set; }
        public decimal Value { get; set; }
        public decimal Weight { get; set; }
        public string Invoice { get; set; }
        public string XTN { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string Telephone { get; set; }
        public string Exonerate { get; set; }
    }

    public class ManifestReport_ExcelData
    {
        public ManifestReport_GeneralInfo? GeneralInfo { get; set; }
        public List<ManifestReport_BillingInfo>? BillingData { get; set; }
    }


    public class ManifestReport_BagExcelData
    {
        public ManifestReport_GeneralInfo? GeneralInfo { get; set; }
        public List<ManifestReport_BagInfo>? BagBillingData { get; set; }
    }



    public class CourierDeconsolidationModel
    {
        public string PackageNumber { get; set; }
        public string Customer { get; set; }
        public string Company { get; set; }
        public string Identification { get; set; }
        public string TypeOfIdentification { get; set; }
        public string City { get; set; }
        public string Courier { get; set; }
        public string ManifestNumber { get; set; }
        public string Origin { get; set; }
        public string Description { get; set; }
        public decimal Weight { get; set; }
        public int Packages { get; set; }
        public decimal FOBValue { get; set; }
        public string SecM { get; set; }
        public string Category { get; set; }
        public string DestinationLocation { get; set; }
        public decimal FreightValue { get; set; }
        public string Currency { get; set; }

    }

    public class PackageManifestInfo
    {
        public int ManifestID { get; set; }
        public string ManifestNumber { get; set; }
        public string ManifestCountry { get; set; }
        public string PackageNumber { get; set; }
        public string CustomerAccount { get; set; }
        public int Line { get; set; }
        public int PackageID { get; set; }
        public string PackageDescription { get; set; }
        public string PackageCountry { get; set; }
        public string CustomerName { get; set; }
        public string Zone { get; set; }
        public string Area { get; set; }
        public string CountryName { get; set; }
        public string TotalLabel { get; set; }
        public bool UseTransport { get; set; }
        public string BagReference { get; set; }
        public int PackageStatusID { get; set; }
        public string CustomerCompanyName { get; set; }
        public bool BillingByCompany { get; set; }
        public string CityName { get; set; }
        public string Address1 { get; set; }
        public string Address2 { get; set; }
        public string IdentificationNumber { get; set; }
        public string DocumentType { get; set; }
        public string TaxType { get; set; }
        public decimal Weight { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal Length { get; set; }
        public decimal VolumetricWeight { get; set; }
        public decimal Price { get; set; }
        public string Origin { get; set; }
        public string Courier { get; set; }
        public string CourierName { get; set; }
        public int LeaderPackage { get; set; }
    }


    public class RouteSheet
    {
        public string ManifestNumber { get; set; }
        public DateTime ManifestDate { get; set; }
        public string ClientCode { get; set; }
        public string ClientFullName { get; set; }
        public string ClientAddress { get; set; }
        public int PackageID { get; set; }
        public string PackageNumber { get; set; }
        public string PackageDescription { get; set; }
        public string PackageOrigin { get; set; }
        public decimal PackageWeight { get; set; }
        public decimal PackagePrice { get; set; }
        public string PackageType { get; set; }
        public string AreaCode { get; set; }
        public string StopName { get; set; }
        public string ZoneCode { get; set; }
        public string ZoneName { get; set; }
    }

    public class RouteSheetDetail
    {
        public int RouteSheetID { get; set; }
        public string Description { get; set; }
        public string UserID { get; set; }
        public DateTime CreationDate { get; set; }
        public DateTime? CloseDate { get; set; }
        public string Status { get; set; }
        public string Zone { get; set; }
        public string Areas { get; set; }
        public string DeliveryType { get; set; }
        public string Branch { get; set; }
    }

    public class RouteInsert
    {
        public string Description { get; set; }
        public string UserId { get; set; }
        public int Status { get; set; }
        public int ZoneId { get; set; }
        public int? Id { get; set; }
        public int DeliveryTypeId { get; set; }
        public int PointOfSaleId { get; set; }
        public string CompanyId { get; set; }
        public List<int> PackageIds { get; set; } = new List<int>();
    }

    public class RoutePackageReport
    {
        public string ManifestNumber { get; set; }
        public DateTime ManifestDate { get; set; }
        public string ClientCode { get; set; }
        public string FullName { get; set; }
        public string Address { get; set; }
        public string PackageNumber { get; set; }
        public string Description { get; set; }
        public string Origin { get; set; }
        public decimal Weight { get; set; }
        public decimal Price { get; set; }
        public int Pieces { get; set; }
        public string PackageType { get; set; }
        public string AreaCode { get; set; }
        public string Stop { get; set; }
        public string ZoneCode { get; set; }
        public string Zone { get; set; }
        public int StatusId { get; set; }
        public int RouteSheetId { get; set; }
        public int PackageId { get; set; }
        public string Comment { get; set; }
        public string Courier { get; set; }
        public string InvoiceNumber { get; set; }
        public string RouteSheetName { get; set; }
    }

    public class DeliveryTypes
    {
        public int DeliveryType { get; set;}
        public string Description { get; set;}
    }

    public class RoadMapstReport
    {
        public string ManifestNumber { get; set; }
        public DateTime ManifestDate { get; set; }
        public string ClientCode { get; set; }
        public string ClientName { get; set; }
        public string Address { get; set; }
        public string PackageNumber { get; set; }
        public string Description { get; set; }
        public string Origin { get; set; }
        public decimal Weight { get; set; }
        public decimal Price { get; set; }
        public int Pieces { get; set; }
        public string PackageType { get; set; }
        public string AreaCode { get; set; }
        public string StopName { get; set; }
        public string ZoneCode { get; set; }
        public string Zone { get; set; }
        public int StatusId { get; set; }
        public int RouteSheetId { get; set; }
        public int PackageId { get; set; }
        public string Comment { get; set; }
        public string Courier { get; set; }
        public string InvoiceNumber { get; set; }
        public string RouteSheetName { get; set; }
    }


    public class ParcelDeliveryReport
    {
        public string FullName { get; set; }
        public string InvoiceNumber { get; set; }
        public decimal Amount { get; set; }
    }

    public class AddManifestPackageRequest
    {
        public int ManifestId { get; set; }
        public int PackageNumber { get; set; }
        public string ManifestNumber { get; set; }
        public string CreatedBy { get; set; }
        public string Type { get; set; }
        public int ManifestStatusId { get; set; }
        public string TrackingNumber { get; set; }
        public string TrackingAddress { get; set; }
        public int ManifestShipmentType { get; set; }
        public string Gateway { get; set; }
    }

    public class AddManifestPackageResponse
    {
        public int Response { get; set; }

        public string ResponseMessage
        {
            get
            {
                return Response switch
                {
                    0 => "Manifested successfully.",
                    1 => "Package is already manifested.",
                    2 => "Shipment type mismatch with the manifest.",
                    3 => "Client's country does not match manifest's country (Distributor mode).",
                    4 => "Manifest's country not allowed for export (Gateway mode).",
                    _ => "Unknown result."
                };
            }
        }
    }

    public class PackagingCourierReport
    {
        public int ID { get; set; }
        public string ManifestNumber { get; set; }
        public int PackageCount { get; set; }
        public string SealNumber { get; set; }
        public string Dimensions { get; set; }
        public decimal SystemGrossWeight { get; set; }
        public decimal PhysicalGrossWeight { get; set; }
        public decimal SystemVolWeight { get; set; }
        public decimal PhysicalVolWeight { get; set; }
        public int PendingPackages { get; set; }
        public int TotalSeals { get; set; }
    }

    public class PackagingConsolidatedReport
    {
        public string ManifestNumber { get; set; }
        public string SubGuideNumber { get; set; }
        public string CarrierAddress { get; set; }
        public string Shipper { get; set; }
        public string ConsigneeInfo { get; set; }
        public decimal TotalWeight { get; set; }
        public decimal TotalVolumetricWeight { get; set; }
        public int TotalPackages { get; set; }
        public string DepartureAirport { get; set; }
        public string DestinationAirport { get; set; }

        public string Address { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public DateTime Date { get; set; }
    }

    public class PackagingConsolidatedReport_ExcelData
    {
        public int Id { get; set; }
        public string Country { get; set; }
        public DateTime Date { get; set; }
        public string Address { get; set; }
        public DateTime CurrentDate { get; set; } = DateTime.Now;
    }


    public class PackagingConsolidatedReport_data
    {
        public PackagingConsolidatedReport_ExcelData? GeneralInfo { get; set; }
        
    }




}