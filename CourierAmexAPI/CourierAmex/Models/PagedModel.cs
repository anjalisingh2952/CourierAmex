namespace CourierAmex.Models
{
    public class PagedResponse<T>
    {
        public bool Success { get; set; }
        public int TotalRows { get; set; }
        public IEnumerable<T> Data { get; set; }

        public PagedResponse()
        {
            Success = false;
            TotalRows = 0;
            Data = new List<T>();
        }
    }
}
