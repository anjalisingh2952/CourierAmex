namespace CourierAmex.Models
{
    public class UserModel : BaseEntityModel<string>
    {
        public required string Name { get; set; }
        public required string Lastname { get; set; }
        public required string Username { get; set; }
        public string? Email { get; set; }
        public string? Mobile { get; set; }
        public string? Phone { get; set; }
        public string? Office { get; set; }
        public int? CountryId { get; set; }
        public short? StateId { get; set; }
        public string? AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string? City { get; set; }
        public string? Zip { get; set; }
        public byte? Gender { get; set; }
        public int CompanyId { get; set; }
        public byte OperationType { get; set; }
        public byte SessionTimeout { get; set; }
        public long? DateOfBirth { get; set; }
        public long? LastLoginDate { get; set; }
        public bool ChangePassword { get; set; }
        public CompanyModel? Company { get; set; }
        public IEnumerable<RoleModel>? Roles { get; set; }
        public IEnumerable<PermissionModel>? Permissions { get; set; }
    }

    public class ChangePasswordModel
    {
        public required string Id { get; set; }
        public required string CurrentPassword { get; set; }
        public required string NewPassword { get; set; }
    }
}
