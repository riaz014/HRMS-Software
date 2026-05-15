using HRMS.Domain.Entities;

namespace HRMS.Application.Interfaces.Persistence;

public interface IPayrollRepository : IGenericRepository<Payroll>
{
    Task<IReadOnlyList<Payroll>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Payroll>> GetByPeriodAsync(int year, int month, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Payroll>> GetRecentAsync(int take = 20, CancellationToken cancellationToken = default);
    Task<Payroll?> GetForPeriodAsync(int employeeId, int year, int month, CancellationToken cancellationToken = default);
    Task<decimal> GetDepartmentTotalNetPayAsync(int departmentId, int year, int month, CancellationToken cancellationToken = default);
}
