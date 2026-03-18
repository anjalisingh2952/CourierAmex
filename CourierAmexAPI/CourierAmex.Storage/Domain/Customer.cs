namespace CourierAmex.Storage.Domain
{
    public class Customer : BaseEntity<long>
    {
        //EMP_EMPRESAID
        public required int CompanyId { get; set; }
        //TIPODOCUMENTO
        public required int DocumentTypeId { get; set; }
        //NUMERODOCUMENTO
        public required string DocumentId { get; set; }
        //NOMBRE
        public required string Name { get; set; }
        //APELLIDO1
        public required string Lastname { get; set; }
        //APELLIDO2
        public string? Lastname2 { get; set; }
        //NOMBRECOMPLETO
        public string? FullName { get; set; }
        //COMPANIA
        public string? CompanyName { get; set; }
        //CODIGO
        public required string Code { get; set; }
        //PAI_ID
        public required int CountryId { get; set; }
        //CIUDAD_ID
        public required int StateId { get; set; }
        //ZON_ID
        public required int ZoneId { get; set; }
        //ARE_ID
        public required int AreaId { get; set; }
        //IDENTIFICACION
        public string? Identification { get; set; }
        //TIPOIDENTIFICADOR
        public int IdentificationType { get; set; }
        //ENVIOAEREO
        public bool ShipByAir { get; set; }
        //ENVIOMARITIMO
        public bool ShipBySea { get; set; }
        //Tmp
        public int Tmp { get; set; }
        //CAMBIA
        public int Change { get; set; }
        //COMPLEMENTO
        public string? Complement { get; set; }
        //FACTURABLE
        public int Billable { get; set; }
        //SINCRONIZADO
        public bool Synched { get; set; }
        //CONTACTO_AUTORIZADO
        public string? Contact { get; set; }
        //ENCOMIENDA
        public bool UseBusShipment { get; set; }
        //EMPRESA_ID
        public int SupplierId { get; set; }
        //DESTINO_ID
        public int LocationId { get; set; }
        //ENTREGA
        public bool UseDelivery { get; set; }
        //FACTURAR_COMPANNIA
        public bool BillCompany { get; set; }
        //TIPOPAGO_ID
        public int CustomerPayTypeId { get; set; }
        //DIRECCION
        public string? Address { get; set; }
        //DIRECCION1
        public string? AddressLine1 { get; set; }
        //DIRECCION2
        public string? AddressLine2 { get; set; }
        //EMAIL_FACTURAELECTRONICA
        public string? BillableEmail { get; set; }
        //EMAIL_CLIENTE
        public required string Email { get; set; }
        //PASSWORD
        public string? PasswordHash { get; set; }
        //LastLoginDate
        public DateTime? LastLoginDate { get; set; }
        //Token
        public string? Token { get; set; }
        //SecurityStamp
        public string? SecurityStamp { get; set; }
        //PASSWORD_PLANO
        public string? Password { get; set; }
        //Role
        public short? Role { get; set; }
        //CATEGORIA
        public byte? ClientCategoryId { get; set; }
        //REFERRED_BY
        public string? ReferredBy { get; set; }
    }

    public class CustomerCreditModel
    {
        public string CustomerCode { get; set; }
        public string CustomerName { get; set; }
        public string Identification { get; set; }
        public int CompanyId { get; set; }


      
    }

    public class CustomerCreditRequest
    {
        public string CustomerCode { get; set; }
        public int CompanyId { get; set; }
    }


}
