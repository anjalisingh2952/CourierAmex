namespace CourierAmex.Models
{
  public class RoleModel : BaseEntityModel<string>
  {
    public required int CompanyId { get; set; }
    public required string Name { get; set; }
    public bool IsSelected { get; set; }
    public string? CompanyName { get; set; }
    public IEnumerable<PermissionModel>? RolePermissions { get; set; }
  }
}
