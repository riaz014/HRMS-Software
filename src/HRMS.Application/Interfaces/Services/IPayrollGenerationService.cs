using HRMS.Application.Models.Payroll;

namespace HRMS.Application.Interfaces.Services;

public interface IPayrollGenerationService
{
    Task<GenerateMonthlyPayrollResult> GenerateMonthlyPayrollAsync(
        GenerateMonthlyPayrollRequest request,
        CancellationToken cancellationToken = default);

    Task RegenerateEmployeePayrollAsync(
        int employeeId,
        CancellationToken cancellationToken = default);
}
