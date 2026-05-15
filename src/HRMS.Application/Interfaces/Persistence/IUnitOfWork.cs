using HRMS.Domain.Entities;

namespace HRMS.Application.Interfaces.Persistence;

public interface IUnitOfWork
{
    IEmployeeRepository Employees { get; }
    IGenericRepository<Department> Departments { get; }
    IGenericRepository<Salary> Salaries { get; }
    IPayrollRepository Payrolls { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
