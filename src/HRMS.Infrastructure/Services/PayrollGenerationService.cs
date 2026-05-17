using HRMS.Application.Interfaces.Persistence;
using HRMS.Application.Interfaces.Services;
using HRMS.Application.Models.Payroll;
using HRMS.Domain.Entities;

namespace HRMS.Infrastructure.Services;

public sealed class PayrollGenerationService : IPayrollGenerationService
{
    private readonly IUnitOfWork _unitOfWork;

    public PayrollGenerationService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<GenerateMonthlyPayrollResult> GenerateMonthlyPayrollAsync(
        GenerateMonthlyPayrollRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Month < 1 || request.Month > 12)
        {
            throw new ArgumentOutOfRangeException(nameof(request.Month), "Month must be between 1 and 12.");
        }

        var payrollPeriod = new DateTime(request.Year, request.Month, 1);
        var periodStart = payrollPeriod;
        var periodEnd = payrollPeriod.AddMonths(1).AddDays(-1);
        var activeEmployees = await _unitOfWork.Employees.GetActiveEmployeesAsync(cancellationToken);

        var generatedCount = 0;
        var updatedCount = 0;
        var skippedExistingCount = 0;
        var skippedNoSalaryCount = 0;

        foreach (var employee in activeEmployees)
        {
            var existingPayroll = await _unitOfWork.Payrolls.GetForPeriodAsync(
                employee.Id,
                request.Year,
                request.Month,
                cancellationToken);

            var salary = (await _unitOfWork.Salaries.FindAsync(
                    x => x.EmployeeId == employee.Id
                        && x.EffectiveFrom <= periodEnd
                        && (!x.EffectiveTo.HasValue || x.EffectiveTo >= periodStart),
                    cancellationToken))
                .OrderByDescending(x => x.EffectiveFrom)
                .FirstOrDefault();

            if (salary is null)
            {
                skippedNoSalaryCount++;
                continue;
            }

            // Payroll formula: Gross = Base + Bonus, Total Deductions = Taxes + Salary Deductions + Additional Deductions
            var baseSalary = salary.BasicAmount;
            var bonuses = salary.AllowanceAmount + request.AdditionalBonus;
            var grossPay = Math.Round(baseSalary + bonuses, 2, MidpointRounding.AwayFromZero);
            var taxes = Math.Round(grossPay * (request.TaxPercentage / 100m), 2, MidpointRounding.AwayFromZero);
            var totalDeductions = Math.Round(taxes + salary.DeductionAmount + request.AdditionalDeductions, 2, MidpointRounding.AwayFromZero);
            var netPay = Math.Round(grossPay - totalDeductions, 2, MidpointRounding.AwayFromZero);

            if (existingPayroll is not null)
            {
                existingPayroll.SalaryId = salary.Id;
                existingPayroll.GrossPay = grossPay;
                existingPayroll.Deductions = totalDeductions;
                existingPayroll.NetPay = netPay;
                existingPayroll.ProcessedAtUtc = DateTime.UtcNow;
                existingPayroll.UpdatedAtUtc = DateTime.UtcNow;

                _unitOfWork.Payrolls.Update(existingPayroll);
                updatedCount++;
                continue;
            }

            var payrollTransaction = new Payroll
            {
                EmployeeId = employee.Id,
                SalaryId = salary.Id,
                PayrollYear = request.Year,
                PayrollMonth = request.Month,
                GrossPay = grossPay,
                Deductions = totalDeductions,
                NetPay = netPay,
                ProcessedAtUtc = DateTime.UtcNow,
                CreatedAtUtc = DateTime.UtcNow
            };

            await _unitOfWork.Payrolls.AddAsync(payrollTransaction, cancellationToken);
            generatedCount++;
        }

        if (generatedCount > 0 || updatedCount > 0)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return new GenerateMonthlyPayrollResult
        {
            ActiveEmployeesCount = activeEmployees.Count,
            GeneratedCount = generatedCount,
            UpdatedCount = updatedCount,
            SkippedExistingCount = skippedExistingCount,
            SkippedNoSalaryCount = skippedNoSalaryCount
        };
    }

    /// <summary>
    /// Regenerates payroll for a specific employee (when salary is updated).
    /// Recalculates payroll for current and recent months.
    /// </summary>
    public async Task RegenerateEmployeePayrollAsync(
        int employeeId,
        CancellationToken cancellationToken = default)
    {
        // Get current date to determine which months to regenerate
        var now = DateTime.UtcNow;
        var currentYear = now.Year;
        var currentMonth = now.Month;
        
        // Regenerate payroll for current month and previous month (in case salary change affects recent periods)
        var monthsToRegenerate = new[] 
        { 
            (currentYear, currentMonth),
            (currentMonth == 1 ? currentYear - 1 : currentYear, currentMonth == 1 ? 12 : currentMonth - 1)
        };

        foreach (var (year, month) in monthsToRegenerate)
        {
            var payrollPeriod = new DateTime(year, month, 1);
            var periodStart = payrollPeriod;
            var periodEnd = payrollPeriod.AddMonths(1).AddDays(-1);
            
            // Delete existing payroll for this employee in this period
            var existingPayrolls = await _unitOfWork.Payrolls.FindAsync(
                x => x.EmployeeId == employeeId
                    && x.PayrollYear == year
                    && x.PayrollMonth == month,
                cancellationToken);

            foreach (var payroll in existingPayrolls)
            {
                _unitOfWork.Payrolls.Remove(payroll);
            }

            // Find current salary for this period
            var salary = (await _unitOfWork.Salaries.FindAsync(
                    x => x.EmployeeId == employeeId
                        && x.EffectiveFrom <= periodEnd
                        && (!x.EffectiveTo.HasValue || x.EffectiveTo >= periodStart),
                    cancellationToken))
                .OrderByDescending(x => x.EffectiveFrom)
                .FirstOrDefault();

            if (salary is not null)
            {
                // Recalculate payroll with current salary
                var baseSalary = salary.BasicAmount;
                var bonuses = salary.AllowanceAmount;
                var grossPay = Math.Round(baseSalary + bonuses, 2, MidpointRounding.AwayFromZero);
                var taxes = Math.Round(grossPay * 0.10m, 2, MidpointRounding.AwayFromZero); // Default 10% tax
                var totalDeductions = Math.Round(taxes + salary.DeductionAmount, 2, MidpointRounding.AwayFromZero);
                var netPay = Math.Round(grossPay - totalDeductions, 2, MidpointRounding.AwayFromZero);

                var payrollTransaction = new Payroll
                {
                    EmployeeId = employeeId,
                    SalaryId = salary.Id,
                    PayrollYear = year,
                    PayrollMonth = month,
                    GrossPay = grossPay,
                    Deductions = totalDeductions,
                    NetPay = netPay,
                    ProcessedAtUtc = DateTime.UtcNow,
                    CreatedAtUtc = DateTime.UtcNow
                };

                await _unitOfWork.Payrolls.AddAsync(payrollTransaction, cancellationToken);
            }
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
