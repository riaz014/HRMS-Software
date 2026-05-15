namespace HRMS.Application.Models.Payroll;

public sealed class GenerateMonthlyPayrollRequest
{
    public int Year { get; init; }
    public int Month { get; init; }
    public decimal TaxPercentage { get; init; }
    public decimal AdditionalBonus { get; init; }
    public decimal AdditionalDeductions { get; init; }
}
