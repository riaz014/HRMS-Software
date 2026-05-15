using HRMS.Application.Models.Auth;

namespace HRMS.Application.Interfaces.Services;

public interface ITokenService
{
    TokenResult GenerateToken(string username, string role);
}
