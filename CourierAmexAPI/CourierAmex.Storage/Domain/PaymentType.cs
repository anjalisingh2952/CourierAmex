namespace CourierAmex.Storage.Domain
{
    //Table Name: FC_TIPOPAGO
    public class PaymentType : BaseEntity<int>
    {
        //IDEMPRESA
        public required int CompanyId { get; set; }
        //Descripcion
        public string? Name { get; set; }

    }
}
