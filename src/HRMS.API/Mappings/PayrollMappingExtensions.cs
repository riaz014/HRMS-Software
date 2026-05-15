using HRMS.API.DTOs.Payroll;
using HRMS.Domain.Entities;

namespace HRMS.API.Mappings;

public static class PayrollMappingExtensions
{
    public static RecentPayrollItemDto ToRecentPayrollItemDto(this Payroll payroll)
    {
        return new RecentPayrollItemDto
        {
            PayrollId = payroll.Id,
            EmployeeId = payroll.EmployeeId,
            EmployeeName = $"{payroll.Employee.FirstName} {payroll.Employee.LastName}".Trim(),
            EmployeeNumber = payroll.Employee.EmployeeNumber,
            PayrollYear = payroll.PayrollYear,
            PayrollMonth = payroll.PayrollMonth,
            GrossPay = payroll.GrossPay,
            Deductions = payroll.Deductions,
            NetPay = payroll.NetPay,
            ProcessedAtUtc = payroll.ProcessedAtUtc,
            Status = "Processed"
        };
    }
}
