namespace HRMS.API.DTOs.Salary;

public sealed class SalaryResponseDto
{
    public int Id { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public decimal BasicAmount { get; set; }
    public decimal AllowanceAmount { get; set; }
    public decimal DeductionAmount { get; set; }
    public decimal TotalCompensation { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
}
