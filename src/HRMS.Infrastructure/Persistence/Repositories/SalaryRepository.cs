using HRMS.Application.Interfaces.Persistence;
using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Infrastructure.Persistence.Repositories;

public sealed class SalaryRepository : GenericRepository<Salary>, ISalaryRepository
{
    public SalaryRepository(ApplicationDbContext context)
        : base(context)
    {
    }

    public async Task<IReadOnlyList<Salary>> GetAllWithEmployeeAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(x => x.Employee)
            .OrderByDescending(x => x.EffectiveFrom)
            .ToListAsync(cancellationToken);
    }

    public async Task<Salary?> GetByIdWithEmployeeAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(x => x.Employee)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Salary>> GetByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(x => x.Employee)
            .Where(x => x.EmployeeId == employeeId)
            .OrderByDescending(x => x.EffectiveFrom)
            .ToListAsync(cancellationToken);
    }

    public async Task<Salary?> GetCurrentByEmployeeAsync(int employeeId, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.EffectiveTo == null, cancellationToken);
    }
}
