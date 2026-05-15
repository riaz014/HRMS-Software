namespace HRMS.API.DTOs.Payroll;

public sealed class PayrollReportDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalTransactions { get; set; }
    public decimal TotalGrossPay { get; set; }
    public decimal TotalDeductions { get; set; }
    public decimal TotalNetPay { get; set; }
    public IReadOnlyList<PayrollReportItemDto> Items { get; set; } = Array.Empty<PayrollReportItemDto>();
}
