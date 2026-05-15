namespace HRMS.Domain.Entities;

public sealed class Payroll : BaseEntity
{
    public int EmployeeId { get; set; }
    public int SalaryId { get; set; }
    public int PayrollYear { get; set; }
    public int PayrollMonth { get; set; }
    public decimal GrossPay { get; set; }
    public decimal Deductions { get; set; }
    public decimal NetPay { get; set; }
    public DateTime ProcessedAtUtc { get; set; }

    public Employee Employee { get; set; } = null!;
    public Salary Salary { get; set; } = null!;
}
