namespace HRMS.Application.Models.Auth;

public sealed class TokenResult
{
    public string AccessToken { get; init; } = string.Empty;
    public DateTime ExpiresAtUtc { get; init; }
}
