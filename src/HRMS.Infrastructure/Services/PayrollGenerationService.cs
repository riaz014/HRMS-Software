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
        var activeEmployees = await _unitOfWork.Employees.GetActiveEmployeesAsync(cancellationToken);

        var generatedCount = 0;
        var skippedExistingCount = 0;
        var skippedNoSalaryCount = 0;

        foreach (var employee in activeEmployees)
        {
            var existingPayroll = await _unitOfWork.Payrolls.GetForPeriodAsync(
                employee.Id,
                request.Year,
                request.Month,
                cancellationToken);

            if (existingPayroll is not null)
            {
                skippedExistingCount++;
                continue;
            }

            var salary = (await _unitOfWork.Salaries.FindAsync(
                    x => x.EmployeeId == employee.Id
                        && x.EffectiveFrom <= payrollPeriod
                        && (!x.EffectiveTo.HasValue || x.EffectiveTo >= payrollPeriod),
                    cancellationToken))
                .OrderByDescending(x => x.EffectiveFrom)
                .FirstOrDefault();

            if (salary is null)
            {
                skippedNoSalaryCount++;
                continue;
            }

            // Payroll formula: Gross = Base + Bonus, Taxes = Gross * Tax%, Net = Gross - (Taxes + Deductions)
            var baseSalary = salary.BasicAmount;
            var bonuses = salary.AllowanceAmount + request.AdditionalBonus;
            var grossPay = Math.Round(baseSalary + bonuses, 2, MidpointRounding.AwayFromZero);
            var taxes = Math.Round(grossPay * (request.TaxPercentage / 100m), 2, MidpointRounding.AwayFromZero);
            var totalDeductions = Math.Round(taxes + request.AdditionalDeductions, 2, MidpointRounding.AwayFromZero);
            var netPay = Math.Round(grossPay - totalDeductions, 2, MidpointRounding.AwayFromZero);

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

        if (generatedCount > 0)
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        return new GenerateMonthlyPayrollResult
        {
            ActiveEmployeesCount = activeEmployees.Count,
            GeneratedCount = generatedCount,
            SkippedExistingCount = skippedExistingCount,
            SkippedNoSalaryCount = skippedNoSalaryCount
        };
    }
}
