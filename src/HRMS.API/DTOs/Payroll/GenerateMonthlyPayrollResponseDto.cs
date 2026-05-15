namespace HRMS.API.DTOs.Payroll;

public sealed class GenerateMonthlyPayrollResponseDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int ActiveEmployeesCount { get; set; }
    public int GeneratedCount { get; set; }
    public int SkippedExistingCount { get; set; }
    public int SkippedNoSalaryCount { get; set; }
}
