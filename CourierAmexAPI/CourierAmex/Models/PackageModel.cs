namespace CourierAmex.Models
{
	public class PackageModel : BaseEntityModel<int>
	{
		public required int CompanyId { get; set; } // Requerido
		public required int Number { get; set; }    // Requerido
        public required string CustomerCode { get; set; } // Requerido
        public required string TrackingNumber { get; set; } // Requerido
        public required string CourierName { get; set; } // Requerido
        public required string Origin { get; set; } // Requerido
        public required string Observations { get; set; } // Requerido
		public required int Insurance { get; set; } // Requerido
        public required int Packages { get; set; } // Requerido
        public required int PackageStateId { get; set; } // Requerido
        public required string Description { get; set; } // Requerido
        public required decimal Weight { get; set; } // Requerido
        public required decimal Price { get; set; } // Requerido
        public required decimal Width { get; set; } // Requerido
        public required decimal Height { get; set; } // Requerido
        public required decimal Long { get; set; } // Requerido DEBE AGREGARSE
        public required decimal VolumetricWeight { get; set; } // Requerido
        public required string ReceivedBy { get; set; } // Requerido
        //public required int DestinationId { get; set; } // Ya este campo no se ocupa, eliminar
		//public required int PreviousId { get; set; } // Ya este campo no se ocupa, eliminar
        //public required byte Synched { get; set; } // Ya este campo no se ocupa, eliminar
        public required int PackageType { get; set; } // Requerido
        //public required string Code { get; set; } // Ya este campo no se ocupa, eliminar
        public int Invoiced { get; set; } // No Requerido
        public required int Palets { get; set; } // Requerido
        public required int Bags { get; set; } // Requerido, cambiar el nombre a Bag
        public required decimal TotalWeight { get; set; } // Requerido
        public required string Type { get; set; } // Requerido
        public required string TotalLabel { get; set; } // Requerido
        public required string PackageDetail { get; set; } // Requerido
        public required bool SearchCustomer { get; set; } // Requerido
        public int InvoiceStatus { get; set; } // No Requerido
        public required bool UpdatePrice { get; set; } // Requerido
        public required int HasInvoice { get; set; } // Requerido, cambiar nombre a HaveInvoice
        public required int PreStudy { get; set; } // Requerido, Cambiar nombre Previo
        public required string Dua { get; set; } // Requerido
        public required int CommodityId { get; set; } // Requerido
        public required string Resources { get; set; } // Requerido
        public required string Category { get; set; } // Requerido
        public decimal CubicFeet { get; set; } // No Requerido
        public int TaxType { get; set; }

        public string? CompanyName { get; set; }
		public string? CustomerName { get; set; }
		public string? CustomerDNI { get; set; }
		public string? PackageStateName { get; set; }
		public string? CommodityCode { get; set; }
		public string? CommodityName { get; set; }

        public string? ManifestNumber { get; set; }           // clickable
        public string? InvoiceNumber { get; set; }            // clickable
        public string? RoadmapNumber { get; set; }            // clickable
        public decimal? CustomerBalance { get; set; }         
        public string? Zone { get; set; }             // from customer

        public string Message { get; set; }

        public DateTime CreatedAt { get; set; }
        public int ZoneId { get; set; }

    }

    public class ClassifyPackage
	{
        public int Id { get; set; }
        public short ShipTypeId { get; set; }
        public short IssueTypeId { get; set; }
        public short ManifestId { get; set; }
    }

    public class PackagePriceUpdateModel
    {
        public required int PackageNumber { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
        public bool IsPermission { get; set; }
        public bool IsDocument { get; set; }
    }

    public class UnassignPackageRequestModel
    {
        public int PackageId { get; set; }
        public int ManifestId { get; set; }
        public int InitialStateId { get; set; }
        public string ModifiedBy { get; set; }
        public bool ForceRemove { get; set; }
    }

   







}


