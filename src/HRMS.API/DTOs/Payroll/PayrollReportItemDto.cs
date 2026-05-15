namespace HRMS.API.DTOs.Payroll;

public sealed class PayrollReportItemDto
{
    public int PayrollId { get; set; }
    public int EmployeeId { get; set; }
    public string EmployeeName { get; set; } = string.Empty;
    public string EmployeeNumber { get; set; } = string.Empty;
    public decimal GrossPay { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetPay { get; set; }
    public DateTime ProcessedAtUtc { get; set; }
}
