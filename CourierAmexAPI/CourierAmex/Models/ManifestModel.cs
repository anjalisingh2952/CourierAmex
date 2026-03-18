using System.Data;

namespace CourierAmex.Models
{
    public class ManifestModel : BaseEntityModel<long>
    {
        public required int CompanyId { get; set; }
        public required string ManifestNumber { get; set; }
        public required long ManifestDate { get; set; }
        public required string Address { get; set; }
        public required int Closed { get; set; }
        public required string Name { get; set; }
        public required int ShipType { get; set; }
        public required int ShippingWay { get; set; }
        public byte Ready { get; set; }
        public string? CountryCode { get; set; }
        public byte Invoiced { get; set; }
        public int Synchronized { get; set; }
        public string? Type { get; set; }
        public int InvoiceStatus { get; set; }
        public int AutomaticBilling { get; set; }

        public string? CompanyName { get; set; }
        public string? ShippingWayName { get; set; }
    }

    public class PackageManifestInfoModel
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

    public class RouteSheetModel
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

    public class RouteInsertModel
    {
        public string? Description { get; set; }
        public string? UserId { get; set; }
        public int? Status { get; set; }
        public int? ZoneId { get; set; }
        public int? Id { get; set; }
        public int? DeliveryTypeId { get; set; }
        public int? PointOfSaleId { get; set; }
        public string? CompanyId { get; set; }
        public List<int>? PackageIds { get; set; } = new List<int>();
    }

    public class RouteSheetDetailModel
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

    public class RoutePackageReportModel
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

    public class DeliveryTypesModel
    {
        public int DeliveryType { get; set; }
        public string Description { get; set; }
    }

    public class DeletePackageRequest
    {
        public List<int> PackageId { get; set; }
        public int RoadMapId { get; set; }
    }

    public class RoadMapstReportModel
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

    public class ParcelDeliveryReportModel
    {
        public string FullName { get; set; }
        public string InvoiceNumber { get; set; }
        public decimal Amount { get; set; }
    }

    public class InsertNotificationModel
    {
        public int PackageNumber { get; set; }
        public string DocType { get; set; }
        public int Status { get; set; }
    }

}

