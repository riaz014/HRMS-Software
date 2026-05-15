using HRMS.Domain.Entities;

namespace HRMS.Application.Interfaces.Persistence;

public interface IEmployeeRepository : IGenericRepository<Employee>
{
    Task<IReadOnlyList<Employee>> GetActiveEmployeesAsync(CancellationToken cancellationToken = default);

    Task<IReadOnlyList<Employee>> SearchAsync(
        string? name,
        int? departmentId,
        string? departmentName,
        CancellationToken cancellationToken = default);

    Task<Employee?> GetByIdWithDepartmentAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmailAsync(string email, int? excludeEmployeeId = null, CancellationToken cancellationToken = default);
    Task<bool> ExistsByEmployeeNumberAsync(string employeeNumber, int? excludeEmployeeId = null, CancellationToken cancellationToken = default);
}
