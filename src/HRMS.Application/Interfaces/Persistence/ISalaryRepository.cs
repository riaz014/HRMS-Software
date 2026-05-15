using HRMS.Domain.Entities;

namespace HRMS.Application.Interfaces.Persistence;

public interface ISalaryRepository : IGenericRepository<Salary>
{
    Task<IReadOnlyList<Salary>> GetAllWithEmployeeAsync(CancellationToken cancellationToken = default);
    Task<Salary?> GetByIdWithEmployeeAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Salary>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);
    Task<Salary?> GetCurrentByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);
}
