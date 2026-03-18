using System.ComponentModel.DataAnnotations;

namespace CourierAmex.Storage.Domain
{
    // TABLE: PAQ_PAQUETE_ARTICULOS
    public class PackageItem : BaseEntity<int>
    {
        public int Number { get; set; } // NUMERO
        public string BrandId { get; set; } // ID_MARCA
        public string ModelId { get; set; } // ID_MODELO
        public string? Series { get; set; } // SERIE
        public string Characteristics { get; set; } // CARACTERISTICAS
        public string Description { get; set; } // DESCRIPCION
        public string? Composition { get; set; } // COMPOSICION
        public int Quantity { get; set; } // CANTIDAD
        public decimal UnitCost { get; set; } // COSTO_UNITARIO
        public string Origin { get; set; } // PROCEDENCIA
        public string Source { get; set; } // ORIGEN
        public string State { get; set; } // ESTADO
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

    public class PackageItemModel_PreviousReport_PreStudy
    {
        [Display(Name = "Date")]
        public DateTime? InvoiceDate { get; set; }
        public string Invoice { get; set; }
        [Display(Name = "Customer")]
        public string FullName { get; set; }
        [Display(Name = "Tracking")]
        public int PackageNumber { get; set; }
        public int Quantity { get; set; }
        [Display(Name = "Item")]
        public string ItemNumber { get; set; }
        public string Description { get; set; }
        public string Characteristics { get; set; }
  
   
       
        public string Brand { get; set; }
        public string Model { get; set; }
        [Display(Name = "Unit Cost")]
        public decimal UnitCost { get; set; }
        [Display(Name = "Price")]
        public decimal TotalPrice { get; set; }
        public string Bag { get; set; }
        [Display(Name = "Series")]
        public string SerialNumber { get; set; }
        public string Style { get; set; }
        public string Color { get; set; }
        public string Size { get; set; }
   
        public string Composition { get; set; }

        public string Source { get; set; }
        public string Origin { get; set; }
        public string Status { get; set; }

    


      
       
        [Display(Name = "Package Price")]
        public decimal PackagePrice { get; set; }

        
        public int TotalRows { get; set; }
        public int Id { get; set; }
        public string PackageDescription { get; set; }
    }
}