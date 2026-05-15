using HRMS.Application.Interfaces.Persistence;
using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Infrastructure.Persistence.Repositories;

public sealed class PayrollRepository : GenericRepository<Payroll>, IPayrollRepository
{
    public PayrollRepository(ApplicationDbContext context)
        : base(context)
    {
    }

    public async Task<IReadOnlyList<Payroll>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.Salary)
            .Where(x => x.EmployeeId == employeeId)
            .OrderByDescending(x => x.PayrollYear)
            .ThenByDescending(x => x.PayrollMonth)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Payroll>> GetRecentAsync(int take = 20, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(x => x.Employee)
            .OrderByDescending(x => x.ProcessedAtUtc)
            .Take(take)
            .ToListAsync(cancellationToken);
    }

    public async Task<Payroll?> GetForPeriodAsync(int employeeId, int year, int month, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(x => x.Employee)
            .Include(x => x.Salary)
            .FirstOrDefaultAsync(
                x => x.EmployeeId == employeeId && x.PayrollYear == year && x.PayrollMonth == month,
                cancellationToken);
    }

    public async Task<decimal> GetDepartmentTotalNetPayAsync(int departmentId, int year, int month, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Where(x =>
                x.Employee.DepartmentId == departmentId &&
                x.PayrollYear == year &&
                x.PayrollMonth == month)
            .SumAsync(x => x.NetPay, cancellationToken);
    }
}
