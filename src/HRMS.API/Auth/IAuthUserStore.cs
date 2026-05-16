namespace HRMS.API.Auth;

public interface IAuthUserStore
{
    AuthUserAccount? ValidateCredentials(string username, string password);
    bool ChangePassword(string username, string currentPassword, string newPassword);
    AuthUserAccount? CreateUser(string username, string password, string role);
    IReadOnlyCollection<AuthUserAccount> GetUsers();
    bool ResetPassword(string username, string newPassword);
}
