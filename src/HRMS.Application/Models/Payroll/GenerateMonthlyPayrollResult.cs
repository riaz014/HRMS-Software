namespace HRMS.Application.Models.Payroll;

public sealed class GenerateMonthlyPayrollResult
{
    public int ActiveEmployeesCount { get; init; }
    public int GeneratedCount { get; init; }
    public int SkippedExistingCount { get; init; }
    public int SkippedNoSalaryCount { get; init; }
}
