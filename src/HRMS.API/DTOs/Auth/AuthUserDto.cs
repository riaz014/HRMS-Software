namespace HRMS.API.DTOs.Auth;

public sealed class AuthUserDto
{
    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
}
