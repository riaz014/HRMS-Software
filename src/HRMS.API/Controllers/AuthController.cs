using HRMS.API.DTOs.Auth;
using HRMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers;

/// <summary>
/// Handles authentication operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly ITokenService _tokenService;

    public AuthController(IConfiguration configuration, ITokenService tokenService)
    {
        _configuration = configuration;
        _tokenService = tokenService;
    }

    /// <summary>
    /// Authenticates a user and returns a JWT access token.
    /// </summary>
    /// <param name="request">Login credentials.</param>
    /// <returns>JWT token payload when credentials are valid.</returns>
    [HttpPost("login")]
    public ActionResult<LoginResponseDto> Login([FromBody] LoginRequestDto request)
    {
        var users = _configuration.GetSection("AuthUsers").Get<List<AuthUser>>() ?? new List<AuthUser>();

        var user = users.FirstOrDefault(x =>
            string.Equals(x.Username, request.Username, StringComparison.OrdinalIgnoreCase) &&
            x.Password == request.Password);

        if (user is null)
        {
            return Unauthorized(new { message = "Invalid username or password." });
        }

        var token = _tokenService.GenerateToken(user.Username, user.Role);

        return Ok(new LoginResponseDto
        {
            AccessToken = token.AccessToken,
            ExpiresAtUtc = token.ExpiresAtUtc,
            Username = user.Username,
            Role = user.Role
        });
    }

    private sealed class AuthUser
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
