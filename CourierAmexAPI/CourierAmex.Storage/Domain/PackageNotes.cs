using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CourierAmex.Storage.Domain
{
    //TABLE: CLI_NOTA
    public class PackageNotes : BaseEntity<int>
    {
        //Id
        public int IdNota { get; set; }
        //Codigo
        public string? Codigo { get; set; }
        //Courier
        public string? Courier { get; set; }
        //Mensaje
        public string? Message { get; set; }
        //Fecha Ingreso
        public DateTime? CreatedAt { get; set; }
        //Fecha Vence
        public DateTime? DueDate { get; set; }
        //IdUsuario
        public string? IdUser { get; set; }
        //Sincronizado
        public bool Sincronized { get; set; }
        public string? CompanyName { get; set; } = null;
        public string? NombreCompleto { get; set; }
        public string? Compannia { get; set; }
        public int CompanyId { get; set; }
    }
}
