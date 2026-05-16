using System.Security.Claims;
using HRMS.API.Auth;
using HRMS.API.DTOs.Auth;
using HRMS.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers;

/// <summary>
/// Handles authentication operations.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthUserStore _authUserStore;
    private readonly ITokenService _tokenService;

    public AuthController(IAuthUserStore authUserStore, ITokenService tokenService)
    {
        _authUserStore = authUserStore;
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
        var user = _authUserStore.ValidateCredentials(request.Username, request.Password);

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

    [Authorize]
    [HttpPost("change-password")]
    public IActionResult ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Current and new password are required." });
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "New password must be at least 6 characters long." });
        }

        var username = User.FindFirstValue(ClaimTypes.Name);
        if (string.IsNullOrWhiteSpace(username))
        {
            return Unauthorized(new { message = "Invalid user identity." });
        }

        var updated = _authUserStore.ChangePassword(username, request.CurrentPassword, request.NewPassword);
        if (!updated)
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }

        return Ok(new { message = "Password updated successfully." });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost("users")]
    public ActionResult<AuthUserDto> CreateUser([FromBody] CreateUserRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.Role))
        {
            return BadRequest(new { message = "Username, password, and role are required." });
        }

        if (request.Password.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters long." });
        }

        if (!string.Equals(request.Role, Roles.Admin, StringComparison.Ordinal) &&
            !string.Equals(request.Role, Roles.HrManager, StringComparison.Ordinal))
        {
            return BadRequest(new { message = "Role must be Admin or HR_Manager." });
        }

        var created = _authUserStore.CreateUser(request.Username, request.Password, request.Role);
        if (created is null)
        {
            return Conflict(new { message = "A user with this username already exists." });
        }

        return Ok(new AuthUserDto
        {
            Username = created.Username,
            Role = created.Role
        });
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpGet("users")]
    public ActionResult<IReadOnlyCollection<AuthUserDto>> GetUsers()
    {
        var users = _authUserStore
            .GetUsers()
            .Select(user => new AuthUserDto
            {
                Username = user.Username,
                Role = user.Role
            })
            .ToList();

        return Ok(users);
    }

    [Authorize(Roles = Roles.Admin)]
    [HttpPost("users/reset-password")]
    public IActionResult ResetUserPassword([FromBody] ResetUserPasswordRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.NewPassword))
        {
            return BadRequest(new { message = "Username and new password are required." });
        }

        if (request.NewPassword.Length < 6)
        {
            return BadRequest(new { message = "New password must be at least 6 characters long." });
        }

        var reset = _authUserStore.ResetPassword(request.Username, request.NewPassword);
        if (!reset)
        {
            return NotFound(new { message = "User was not found." });
        }

        return Ok(new { message = "Password reset successfully." });
    }
}
