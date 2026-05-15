using System.ComponentModel.DataAnnotations;

namespace HRMS.API.DTOs.Auth;

public sealed class LoginRequestDto
{
    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Password { get; set; } = string.Empty;
}
