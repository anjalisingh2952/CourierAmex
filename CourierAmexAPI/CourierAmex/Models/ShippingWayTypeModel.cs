namespace CourierAmex.Models
{
    public class ShippingWayTypeModel : BaseEntityModel<int>
    {
        public required int ShipType { get; set; }
        public required string Name { get; set; }
    }
}
