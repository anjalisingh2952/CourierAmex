using CourierAmex.Storage.Domain;

namespace CourierAmex.Models
{
    public class PackageItemModel : BaseEntity<int>
    {
        public int Number { get; set; } // NUMERO
        public required string BrandId { get; set; } // ID_MARCA
        public required string ModelId { get; set; } // ID_MODELO
        public string? Series { get; set; } // SERIE
        public string Characteristics { get; set; } // CARACTERISTICAS
        public required string Description { get; set; } // DESCRIPCION
        public string? Composition { get; set; } // COMPOSICION
        public required int Quantity { get; set; } // CANTIDAD
        public required decimal UnitCost { get; set; } // COSTO_UNITARIO
        public required string Origin { get; set; } // PROCEDENCIA
        public required string Source { get; set; } // ORIGEN
        public required string State { get; set; } // ESTADO
        public string? Style { get; set; } // ESTILO
        public string? Color { get; set; } // COLOR
        public string? Size { get; set; } // TALLA
        public string? Batch { get; set; } // PARTIDA
        public string? Invoice { get; set; } // FACTURA
        public DateTime InclusionDate { get; set; } // FEC_INCLUSION
        public int InclusionUser { get; set; } // USER_INCLUSION
        public DateTime? ModificationDate { get; set; } // FEC_MODIFICA
        public int? ModificationUser { get; set; } // USER_MODIFICA
        public DateTime? InvoiceDate { get; set; } // FECHA_FACTURA
        public decimal? Cost { get; set; } // COSTO
    }

    //public class PackageItemModel_PreviousReport_PreStudy
    //{
    //    public int Id { get; set; }
    //    public string FullName { get; set; }
    //    public int PackageNumber { get; set; }
    //    public string Bag { get; set; }
    //    public string PackageDescription { get; set; }
    //    public string Brand { get; set; }
    //    public string Model { get; set; }
    //    public string SerialNumber { get; set; }
    //    public string Description { get; set; }
    //    public string Composition { get; set; }
    //    public int Quantity { get; set; }
    //    public decimal UnitCost { get; set; }
    //    public string Origin { get; set; }
    //    public string Status { get; set; }
    //    public string Style { get; set; }
    //    public string Color { get; set; }
    //    public string Size { get; set; }
    //    public string ItemNumber { get; set; }
    //    public string Invoice { get; set; }
    //    public string Source { get; set; }
    //    public decimal TotalPrice { get; set; }
    //    public decimal PackagePrice { get; set; }
    //    public string Characteristics { get; set; }
    //    public DateTime? InvoiceDate { get; set; }
    //    public int TotalRows { get; set; }
    //}
}
