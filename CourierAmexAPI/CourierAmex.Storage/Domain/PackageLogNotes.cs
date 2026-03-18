namespace CourierAmex.Storage.Domain
{
    // TABLE: BITACORA_NOTA
	public class PackageLogNotes : BaseEntity<int>
	{
        //id Nota
        public int IdNota { get; set; }
        //Numero correspondel al ID del paquete
        public int? Number { get; set; }
        //corresponde el CODIGO del cliente
        public string? Codigo { get; set; }
        // Es el tracking number
        public string? Courier { get; set; }
        //Id del usuario que creo la nota
        public string? Message { get; set; }
        public string? User { get; set; }
        //Tipo de bitacora 'I' = 'Ingreso', 'U' = 'Modificación', 'D' = 'Borrado', 'V' = 'Mostrada'
        public string? LogType { get; set; }
        //Fecha de la Nota
        public DateTime? CreatedAt { get; set; }
        public string? CompanyName { get; set; }
        public string? CustomerName { get; set; }
    }
}
