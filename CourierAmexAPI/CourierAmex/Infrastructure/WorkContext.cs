namespace CourierAmex.Infrastructure
{
	public class WorkContext
	{
		public string Id { get; set; }

		public WorkContext(string id)
		{
			Id = id;
		}
	}
}
