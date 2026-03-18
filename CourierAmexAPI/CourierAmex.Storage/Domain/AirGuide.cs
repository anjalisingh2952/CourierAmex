namespace CourierAmex.Storage.Domain
{
    public class AirGuide
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public int MasterGuideId { get; set; }
        public int Consecutive { get; set; }
        public string? Type { get; set; }
        public string? Guide { get; set; }
        public string? GuideName { get; set; }
        public string? Consignee { get; set; }
        public string? Contact { get; set; }
        public string? CustomerName { get; set; }
        public string? DocumentTypeId { get; set; }
        public string? DocumentId { get; set; }
        public string? Status { get; set; }

        // ANCHO
        public required decimal Width { get; set; }
        // ALTO
        public required decimal Height { get; set; }
        // LARGO
        public required decimal Long { get; set; }

        // PESOVOLUMETRICO
        public required decimal VolumetricWeightReal { get; set; }
        // PESO
        public required decimal WeightReal { get; set; }

        public required decimal VolumetricWeighSystem { get; set; }
        public required decimal WeightSystem { get; set; }

        public int Packages { get; set; }



    }

    public class MasterGuide
    {
        public int? Id { get; set; }
        public int ManifestId { get; set; }
        public string Shipper { get; set; }
        public string AirWayBill { get; set; }
        public string IssuingCarrierName { get; set; }
        public string IssuingCarrierCity { get; set; }
        public string AirPortDeparture { get; set; }
        public string To { get; set; }
        public string AirPortDestination { get; set; }
        public string FirstCarrier { get; set; }
        public DateTime FlightDate { get; set; }
        public string AccountingInformation { get; set; }
        public string Place { get; set; }
        public string Signature { get; set; }
        public string UserName { get; set; }
        public Guid UserId { get; set; }

    }

    public class ChildGuide
    {
        public int? ChildGuideId { get; set; }  // GUIAHIJA_ID
        public int? ParentGuideId { get; set; } // GUIAMADRE_ID
        public string Type { get; set; }        // TIPO
        public int? Consecutive { get; set; }   // CONSECUTIVO
        public string ChildGuideCode { get; set; } // GUIAHIJA
        public string Consignee { get; set; }   // CONSIGNEE
        public string Contact { get; set; }     // CONTACT
        public string Name { get; set; }        // NOMBRE
        public string IdentificationType { get; set; } // TIPO_IDENTIFICACION
        public string Identification { get; set; }     // IDENTIFICACION
        public string Status { get; set; }      // ESTADO
        public Guid User { get; set; }        // USUARIO
    }

    public class GuideDetail
    {
        public int Id { get; set; }
        public int? MasterGuideId { get; set; }
        public string Type { get; set; }
        public int? Consecutive { get; set; }
        public string Guide { get; set; }
        public string Consignee { get; set; }
        public string Contact { get; set; }
        public string Name { get; set; }
        public string IdentificationType { get; set; }
        public string Identification { get; set; }
        public string Status { get; set; }
        public string UserName { get; set; }
        public DateTime? Date { get; set; }
    }
}
