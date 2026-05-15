namespace HRMS.API.DTOs.Payroll;

public sealed class RecentPayrollItemDto
{
    public int PayrollId { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public int PayrollYear { get; set; }
    public int PayrollMonth { get; set; }
    public decimal GrossPay { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetPay { get; set; }
    public DateTime ProcessedAtUtc { get; set; }
    public string Status { get; set; } = "Processed";
}
