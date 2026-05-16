using Microsoft.Extensions.Configuration;

namespace HRMS.API.Auth;

public sealed class InMemoryAuthUserStore : IAuthUserStore
{
    private readonly object _syncRoot = new();
    private readonly List<AuthUserAccount> _users;

    public InMemoryAuthUserStore(IConfiguration configuration)
    {
        var seededUsers = configuration.GetSection("AuthUsers").Get<List<AuthUserAccount>>() ?? new List<AuthUserAccount>();
        _users = seededUsers
            .Where(x => !string.IsNullOrWhiteSpace(x.Username) && !string.IsNullOrWhiteSpace(x.Password) && !string.IsNullOrWhiteSpace(x.Role))
            .Select(x => new AuthUserAccount
            {
                Username = x.Username.Trim(),
                Password = x.Password,
                Role = x.Role.Trim()
            })
            .ToList();
    }

    public AuthUserAccount? ValidateCredentials(string username, string password)
    {
        lock (_syncRoot)
        {
            return _users.FirstOrDefault(x =>
                string.Equals(x.Username, username, StringComparison.OrdinalIgnoreCase) &&
                x.Password == password);
        }
    }

    public bool ChangePassword(string username, string currentPassword, string newPassword)
    {
        lock (_syncRoot)
        {
            var user = _users.FirstOrDefault(x => string.Equals(x.Username, username, StringComparison.OrdinalIgnoreCase));
            if (user is null || user.Password != currentPassword)
            {
                return false;
            }

            user.Password = newPassword;
            return true;
        }
    }

    public AuthUserAccount? CreateUser(string username, string password, string role)
    {
        lock (_syncRoot)
        {
            if (_users.Any(x => string.Equals(x.Username, username, StringComparison.OrdinalIgnoreCase)))
            {
                return null;
            }

            var created = new AuthUserAccount
            {
                Username = username.Trim(),
                Password = password,
                Role = role.Trim()
            };

            _users.Add(created);
            return created;
        }
    }
}
