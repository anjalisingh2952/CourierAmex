namespace CourierAmex.Storage.Domain
{
  public class Role : BaseEntity<Guid>
  {
		public int CompanyId { get; set; }
		public string? Name { get; set; }
		public bool IsSelected { get; set; }
		public string? CompanyName { get; set; }
		public IEnumerable<Permission>? RolePermissions { get; set; }
  }
}
