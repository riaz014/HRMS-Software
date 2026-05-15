using HRMS.API.DTOs.Salary;
using HRMS.Domain.Entities;

namespace HRMS.API.Mappings;

public static class SalaryMappingExtensions
{
    public static SalaryResponseDto ToSalaryResponseDto(this Salary salary)
    {
        return new SalaryResponseDto
        {
            Id = salary.Id,
            EmployeeId = salary.EmployeeId,
            EmployeeName = $"{salary.Employee.FirstName} {salary.Employee.LastName}".Trim(),
            EmployeeNumber = salary.Employee.EmployeeNumber,
            BasicAmount = salary.BasicAmount,
            AllowanceAmount = salary.AllowanceAmount,
            DeductionAmount = salary.DeductionAmount,
            TotalCompensation = salary.BasicAmount + salary.AllowanceAmount - salary.DeductionAmount,
            EffectiveFrom = salary.EffectiveFrom,
            EffectiveTo = salary.EffectiveTo
        };
    }

    public static Salary ToSalaryEntity(this CreateSalaryRequestDto request)
    {
        return new Salary
        {
            EmployeeId = request.EmployeeId,
            BasicAmount = request.BasicAmount,
            AllowanceAmount = request.AllowanceAmount,
            DeductionAmount = request.DeductionAmount,
            EffectiveFrom = request.EffectiveFrom,
            CreatedAtUtc = DateTime.UtcNow
        };
    }

    public static void ApplyUpdate(this Salary salary, UpdateSalaryRequestDto request)
    {
        salary.BasicAmount = request.BasicAmount;
        salary.AllowanceAmount = request.AllowanceAmount;
        salary.DeductionAmount = request.DeductionAmount;
        salary.EffectiveFrom = request.EffectiveFrom;
        salary.EffectiveTo = request.EffectiveTo;
        salary.UpdatedAtUtc = DateTime.UtcNow;
    }
}
