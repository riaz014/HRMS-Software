using HRMS.Application.Interfaces.Services;
using HRMS.Application.Models.Auth;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace HRMS.Infrastructure.Security;

public sealed class JwtTokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public TokenResult GenerateToken(string username, string role)
    {
        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException("JWT issuer is not configured.");
        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException("JWT audience is not configured.");
        var secret = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("JWT key is not configured.");

        if (secret.Length < 32)
        {
            throw new InvalidOperationException("JWT key must be at least 32 characters long.");
        }

        var expiresInMinutesText = _configuration["Jwt:ExpiresInMinutes"];
        var expiresInMinutes = int.TryParse(expiresInMinutesText, out var parsedValue) ? parsedValue : 120;
        var expiresAtUtc = DateTime.UtcNow.AddMinutes(expiresInMinutes);

        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, username),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(ClaimTypes.Name, username),
            new(ClaimTypes.Role, role),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        return new TokenResult
        {
            AccessToken = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAtUtc = expiresAtUtc
        };
    }
}
