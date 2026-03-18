namespace CourierAmex.Storage.Domain
{
    // TABLE NAME: TIPO_CLASIFICACION
    public class ShippingWayType : BaseEntity<int>
    {
        public required int ShipType { get; set; }
        public required string Name { get; set; }
    }
}
