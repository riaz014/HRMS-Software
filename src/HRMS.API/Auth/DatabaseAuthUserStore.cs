using HRMS.Domain.Entities;
using HRMS.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HRMS.API.Auth;

public sealed class DatabaseAuthUserStore : IAuthUserStore
{
    private readonly ApplicationDbContext _dbContext;

    public DatabaseAuthUserStore(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public AuthUserAccount? ValidateCredentials(string username, string password)
    {
        var normalizedUsername = username.Trim();

        var user = _dbContext.AuthUsers
            .AsNoTracking()
            .FirstOrDefault(x => x.Username.ToLower() == normalizedUsername.ToLower() && x.Password == password);

        return user is null ? null : ToAccount(user, includePassword: true);
    }

    public bool ChangePassword(string username, string currentPassword, string newPassword)
    {
        var normalizedUsername = username.Trim();

        var user = _dbContext.AuthUsers
            .FirstOrDefault(x => x.Username.ToLower() == normalizedUsername.ToLower());

        if (user is null || user.Password != currentPassword)
        {
            return false;
        }

        user.Password = newPassword;
        user.UpdatedAtUtc = DateTime.UtcNow;
        _dbContext.SaveChanges();
        return true;
    }

    public AuthUserAccount? CreateUser(string username, string password, string role)
    {
        var normalizedUsername = username.Trim();

        if (_dbContext.AuthUsers.Any(x => x.Username.ToLower() == normalizedUsername.ToLower()))
        {
            return null;
        }

        var created = new AuthUser
        {
            Username = normalizedUsername,
            Password = password,
            Role = role.Trim(),
            CreatedAtUtc = DateTime.UtcNow
        };

        _dbContext.AuthUsers.Add(created);
        _dbContext.SaveChanges();

        return ToAccount(created, includePassword: false);
    }

    public IReadOnlyCollection<AuthUserAccount> GetUsers()
    {
        return _dbContext.AuthUsers
            .AsNoTracking()
            .OrderBy(x => x.Username)
            .Select(x => new AuthUserAccount
            {
                Username = x.Username,
                Password = string.Empty,
                Role = x.Role
            })
            .ToList();
    }

    public bool ResetPassword(string username, string newPassword)
    {
        var normalizedUsername = username.Trim();

        var user = _dbContext.AuthUsers
            .FirstOrDefault(x => x.Username.ToLower() == normalizedUsername.ToLower());

        if (user is null)
        {
            return false;
        }

        user.Password = newPassword;
        user.UpdatedAtUtc = DateTime.UtcNow;
        _dbContext.SaveChanges();
        return true;
    }

    private static AuthUserAccount ToAccount(AuthUser user, bool includePassword)
    {
        return new AuthUserAccount
        {
            Username = user.Username,
            Password = includePassword ? user.Password : string.Empty,
            Role = user.Role
        };
    }
}