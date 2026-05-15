using HRMS.API.DTOs.Employees;
using HRMS.Domain.Entities;

namespace HRMS.API.Mappings;

public static class EmployeeMappingExtensions
{
    public static EmployeeResponseDto ToEmployeeResponseDto(this Employee employee)
    {
        return new EmployeeResponseDto
        {
            Id = employee.Id,
            EmployeeNumber = employee.EmployeeNumber,
            FirstName = employee.FirstName,
            LastName = employee.LastName,
            FullName = $"{employee.FirstName} {employee.LastName}".Trim(),
            Email = employee.Email,
            DateOfJoining = employee.DateOfJoining,
            IsActive = employee.IsActive,
            DepartmentId = employee.DepartmentId,
            DepartmentName = employee.Department?.Name ?? string.Empty
        };
    }

    public static Employee ToEmployeeEntity(this CreateEmployeeRequestDto request)
    {
        return new Employee
        {
            EmployeeNumber = request.EmployeeNumber.Trim(),
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            DateOfJoining = request.DateOfJoining,
            DepartmentId = request.DepartmentId,
            IsActive = request.IsActive,
            CreatedAtUtc = DateTime.UtcNow
        };
    }

    public static void ApplyUpdate(this Employee employee, UpdateEmployeeRequestDto request)
    {
        employee.EmployeeNumber = request.EmployeeNumber.Trim();
        employee.FirstName = request.FirstName.Trim();
        employee.LastName = request.LastName.Trim();
        employee.Email = request.Email.Trim();
        employee.DateOfJoining = request.DateOfJoining;
        employee.DepartmentId = request.DepartmentId;
        employee.IsActive = request.IsActive;
        employee.UpdatedAtUtc = DateTime.UtcNow;
    }
}
