using System.ComponentModel.DataAnnotations;

namespace HRMS.API.DTOs.Payroll;

public sealed class GenerateMonthlyPayrollRequestDto
{
    [Range(2000, 3000)]
    public int Year { get; set; }

    [Range(1, 12)]
    public int Month { get; set; }

    [Range(0, 100)]
    public decimal TaxPercentage { get; set; }

    [Range(0, 1000000000)]
    public decimal AdditionalBonus { get; set; }

    [Range(0, 1000000000)]
    public decimal AdditionalDeductions { get; set; }
}
