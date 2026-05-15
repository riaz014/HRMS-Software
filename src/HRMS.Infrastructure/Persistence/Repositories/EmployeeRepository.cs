using HRMS.Application.Interfaces.Persistence;
using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HRMS.Infrastructure.Persistence.Repositories;

public sealed class EmployeeRepository : GenericRepository<Employee>, IEmployeeRepository
{
    public EmployeeRepository(ApplicationDbContext context)
        : base(context)
    {
    }

    public async Task<IReadOnlyList<Employee>> GetActiveEmployeesAsync(CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Where(x => x.IsActive)
            .OrderBy(x => x.FirstName)
            .ThenBy(x => x.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<Employee>> SearchAsync(
        string? name,
        int? departmentId,
        string? departmentName,
        CancellationToken cancellationToken = default)
    {
        var query = DbSet
            .AsNoTracking()
            .Include(x => x.Department)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
        {
            var normalizedName = name.Trim();
            query = query.Where(x =>
                x.EmployeeNumber.Contains(normalizedName) ||
                x.FirstName.Contains(normalizedName) ||
                x.LastName.Contains(normalizedName) ||
                (x.FirstName + " " + x.LastName).Contains(normalizedName) ||
                x.Email.Contains(normalizedName) ||
                x.ContactNumber.Contains(normalizedName) ||
                x.Position.Contains(normalizedName) ||
                x.AccountNumber.Contains(normalizedName));
        }

        if (departmentId.HasValue)
        {
            query = query.Where(x => x.DepartmentId == departmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(departmentName))
        {
            var normalizedDepartmentName = departmentName.Trim();
            query = query.Where(x => x.Department.Name.Contains(normalizedDepartmentName));
        }

        return await query
            .OrderBy(x => x.FirstName)
            .ThenBy(x => x.LastName)
            .ToListAsync(cancellationToken);
    }

    public async Task<Employee?> GetByIdWithDepartmentAsync(int id, CancellationToken cancellationToken = default)
    {
        return await DbSet
            .AsNoTracking()
            .Include(x => x.Department)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<bool> ExistsByEmailAsync(string email, int? excludeEmployeeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(x => x.Email == email);

        if (excludeEmployeeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeEmployeeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsByEmployeeNumberAsync(string employeeNumber, int? excludeEmployeeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(x => x.EmployeeNumber == employeeNumber);

        if (excludeEmployeeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeEmployeeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }

    public async Task<bool> ExistsByAccountNumberAsync(string accountNumber, int? excludeEmployeeId = null, CancellationToken cancellationToken = default)
    {
        var query = DbSet.AsNoTracking().Where(x => x.AccountNumber == accountNumber);

        if (excludeEmployeeId.HasValue)
        {
            query = query.Where(x => x.Id != excludeEmployeeId.Value);
        }

        return await query.AnyAsync(cancellationToken);
    }
}
