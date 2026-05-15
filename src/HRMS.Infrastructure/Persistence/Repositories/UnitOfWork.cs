using HRMS.Application.Interfaces.Persistence;
using HRMS.Domain.Entities;

namespace HRMS.Infrastructure.Persistence.Repositories;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public UnitOfWork(
        ApplicationDbContext context,
        IEmployeeRepository employees,
        IGenericRepository<Department> departments,
        IGenericRepository<Salary> salaries,
        IPayrollRepository payrolls)
    {
        _context = context;
        Employees = employees;
        Departments = departments;
        Salaries = salaries;
        Payrolls = payrolls;
    }

    public IEmployeeRepository Employees { get; }
    public IGenericRepository<Department> Departments { get; }
    public IGenericRepository<Salary> Salaries { get; }
    public IPayrollRepository Payrolls { get; }

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return _context.SaveChangesAsync(cancellationToken);
    }
}
