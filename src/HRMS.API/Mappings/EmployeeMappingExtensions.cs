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
            ContactNumber = employee.ContactNumber,
            Position = employee.Position,
            AccountNumber = employee.AccountNumber,
            EmploymentStatus = employee.EmploymentStatus,
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
            ContactNumber = request.ContactNumber.Trim(),
            Position = request.Position.Trim(),
            AccountNumber = request.AccountNumber.Trim(),
            EmploymentStatus = request.EmploymentStatus.Trim(),
            DateOfJoining = request.DateOfJoining,
            DepartmentId = request.DepartmentId,
            IsActive = string.Equals(request.EmploymentStatus, "Active", StringComparison.OrdinalIgnoreCase),
            CreatedAtUtc = DateTime.UtcNow
        };
    }

    public static void ApplyUpdate(this Employee employee, UpdateEmployeeRequestDto request)
    {
        employee.EmployeeNumber = request.EmployeeNumber.Trim();
        employee.FirstName = request.FirstName.Trim();
        employee.LastName = request.LastName.Trim();
        employee.Email = request.Email.Trim();
        employee.ContactNumber = request.ContactNumber.Trim();
        employee.Position = request.Position.Trim();
        employee.AccountNumber = request.AccountNumber.Trim();
        employee.EmploymentStatus = request.EmploymentStatus.Trim();
        employee.DateOfJoining = request.DateOfJoining;
        employee.DepartmentId = request.DepartmentId;
        employee.IsActive = string.Equals(request.EmploymentStatus, "Active", StringComparison.OrdinalIgnoreCase);
        employee.UpdatedAtUtc = DateTime.UtcNow;
    }
}
