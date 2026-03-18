namespace CourierAmex.Storage.Domain
{
	// TABLE: PAQ_PAQUETE
	public class Package : BaseEntity<int>
	{
		// CompanyId
		public int CompanyId { get; set; }
		// NUMERO
		public int Number { get; set; }
		// CLIENTE
		public string CustomerCode { get; set; }
		// COURIER
		public string TrackingNumber { get; set; }
		// NOMBRECOURIER
		public string CourierName { get; set; }
        public string Courier { get; set; }
        // PROCEDENCIA
        public string Origin { get; set; }
		// OBSERVACIONES
		public string Observations { get; set; }
		// SEGURO
		public int Insurance { get; set; }
		// PAQUETES
		public int Packages { get; set; }
		// EST_ID
		public int PackageStateId { get; set; }
		// DESCRIPCION
		public string Description { get; set; }
		// PESO
		public decimal Weight { get; set; }
		// PRECIO
		public decimal Price { get; set; }
		// ANCHO
		public decimal Width { get; set; }
		// ALTO
		public decimal Height { get; set; }
		public decimal Long { get; set; }
		// PESOVOLUMETRICO
		public decimal VolumetricWeight { get; set; }
		// RECIBIDOPOR
		public string ReceivedBy { get; set; }
		// DES_ID
		//public int DestinationId { get; set; }
		// ID_ANTERIOR
		//public int PreviousId { get; set; }
		// SINCRONIZADO
		//public byte Synched { get; set; }
		// TIPOPAQUETE
		public int PackageType { get; set; }
		// COD
		//public string  Code{ get; set; }
		// FACTURADO
		public int Invoiced { get; set; }
		// PALETS
		public int Palets { get; set; }
		// BOLSA
		public int Bags { get; set; }
		// TOTALKILOS
		public decimal TotalWeight { get; set; }
		// TIPO
		public string Type { get; set; }
		// TOTALETIQUETA
		public string TotalLabel { get; set; }
		// DETALLEEMPAQUE
		public string PackageDetail { get; set; }
		// BUSCOCLIENTE
		public bool SearchCustomer { get; set; }
		// ESTADOFACTURA
		public int HasInvoice { get; set; }
		// ACTUALIZOPRECIO
		public bool UpdatePrice { get; set; }
		// TRAEFACTURA
		public int Invoice { get; set; }
		// PREVIO
		public int PreStudy { get; set; }
		// DUA
		public string Dua { get; set; }
		// ID_COMODITY
		public int CommodityId { get; set; }
		// Resources
		public string Resources { get; set; }
		// CATEGORIA
		public string Category { get; set; }
		// PIESCUBICOS
		public decimal CubicFeet { get; set; }
		public int TaxType { get; set; }

		public string? CompanyName { get; set; }
		public string? CustomerName { get; set; }
		public string? CustomerDNI { get; set; }
		public string? PackageStateName { get; set; }
		public string? CommodityCode { get; set; }
		public string? CommodityName { get; set; }
		public string? Dimension { get; set; }
        //TotalWeight,CubicFeet,Weight,VolumeWeight,

        public string? Zone { get; set; }

		public int ZoneId { get; set; }
    }

	public class PackageDetail
	{
		public int CompanyId { get; set; }
		public int ManifestId { get; set; }
		public string ManifestNumber { get; set; }
		public string ManifestType { get; set; }
		public string PackageType { get; set; }
		public DateTime Date { get; set; }
		public int TotalPackage { get; set; }
		public int SortedPackage { get; set; }
		public int Bags { get; set; }
		public int TotalSorted { get; set; }
		public int PendingToBeSorted { get; set; }
    }

	

    public class PackagedPackage
    {

        public DateTime PackagingDate { get; set; }
        public int PackageId { get; set; }
        public int CompanyId { get; set; }
        public int ManifestId { get; set; }
        public string ManifestNumber { get; set; }
        public string PackageNumber { get; set; }
        public string ClientCode { get; set; }
        public string FullName { get; set; }
        public string Company { get; set; }
        public string Origin { get; set; }
        public string Description { get; set; }
        public decimal Weight { get; set; }
        public decimal VolumetricWeight { get; set; }
        public string TaxRate { get; set; }
        public string AirGuide { get; set; }
        public string Category { get; set; }
        public int AirGuideCount { get; set; }
    }

    public class PackagedPackagedResponse
	{
		public List<PackagedPackage> PackagedPackages { get; set; }
		public RegisterBagPackagingRequest PackageDetails { get; set; }
    } 

    public class RegisterBagPackagingRequest
    {
        public int ManifestId { get; set; }
        public string Bag { get; set; }
        public int TaxType { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal Length { get; set; }
        public decimal ActualVolumeWeight { get; set; }
        public decimal ActualWeight { get; set; }
        public decimal SystemVolumeWeight { get; set; }
        public decimal SystemWeight { get; set; }
        public int Packages { get; set; }
        public string PackagingType { get; set; }
        public int Sequence { get; set; }
        public string Category { get; set; }
        public string User { get; set; }
		public int? IsConsolidated { get; set; }
		public int? Pallet { get; set; }
    }

    public class ManifestPackage
    {
        public int Id { get; set; }
        public string PackageNumber { get; set; }
        public string CustomerCode { get; set; }
        public string Courier { get; set; }
        public string CourierName { get; set; }
        public string Origin { get; set; }
        public string Observations { get; set; }
        public bool Insurance { get; set; }
        public string Country { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public string CreatedBy { get; set; }
        public string ModifiedBy { get; set; }
        public int Packages { get; set; }
        public int StatusId { get; set; }
        public string Description { get; set; }
        public decimal Weight { get; set; }
        public decimal Price { get; set; }
        public decimal Width { get; set; }
        public decimal Height { get; set; }
        public decimal Length { get; set; }
        public decimal VolumetricWeight { get; set; }
        public string ReceivedBy { get; set; }
        public int DestinationId { get; set; }
        public string PackageType { get; set; }
        public string CashOnDelivery { get; set; }
        public int Invoiced { get; set; }
        public int Pallets { get; set; }
        public int Bag { get; set; }
        public decimal TotalWeightKilos { get; set; }
        public string Type { get; set; }
        public int TotalLabels { get; set; }
        public string PackageDetails { get; set; }
        public string Address { get; set; }
        public string FullName { get; set; }
        public string Category { get; set; }
    }

    public class UnassignPackageRequest
    {
        public int PackageId { get; set; }
        public int ManifestId { get; set; }
        public int InitialStateId { get; set; }
        public string ModifiedBy { get; set; }
        public bool ForceRemove { get; set; }
    }

    public class PackageInvoiceStatus
    {
        public int PackageNumber { get; set; }
        public string? CustomerAccount { get; set; }

        public string CustomerName { get; set; }
        public string Description { get; set; }
        public decimal Weight { get; set; }
        public decimal Price { get; set; }
        public int HasInvoice { get; set; }
        public DateTime CreationDate { get; set; }
        public decimal Insurance { get; set; }
        public int Id { get; set; }
    }

    public class GetPackageByInvoiceStatusRequest
    {
       
        public string SearchBy { get; set; } = "";
        public int CompanyId { get; set; }
    }

    public class UpdatePackageInvoiceStatusRequest
    {
        public int PackageId { get; set; }
        public int HasInvoice { get; set; } // 1 = Yes, 2 = No
        public int CompanyId { get; set; }
    }

    public class UpdatePackageCommodityPriceModel
    {
        public int PackageNumber { get; set; }

        public string ModifiedBy { get; set; }

        public decimal Price { get; set; }

        public int CommodityId { get; set; }
    }


    public class PendingBillingPackageModel
    {
        public string ManifestNumber { get; set; }
        public string CustomerCode { get; set; }             // Customer Account
        public string CustomerFullName { get; set; }         // Customer Name
        public string PackageNumber { get; set; }
        public string Description { get; set; }
        public decimal Weight { get; set; }
        public decimal Price { get; set; }                   // Editable
        public int? CommodityId { get; set; }                // For Select List
        public string Resources { get; set; }

        public List<string> ResourceFiles =>
        string.IsNullOrWhiteSpace(Resources)
            ? new List<string>()
            : Resources.Split('~', StringSplitOptions.RemoveEmptyEntries)
                       .Take(3)
                       .ToList();// Documents/Images
    }


    public class Commodities
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Description { get; set; }
      
    }


}