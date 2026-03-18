namespace CourierAmex.Models
{
    public class BaseEntityModel<T>
    {
        public T Id { get; set; }
        public byte Status { get; set; }
    }
}
