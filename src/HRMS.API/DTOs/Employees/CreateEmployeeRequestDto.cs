using System.ComponentModel.DataAnnotations;

namespace HRMS.API.DTOs.Employees;

public sealed class CreateEmployeeRequestDto
{
    [Required]
    [StringLength(50)]
    public string EmployeeNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public DateTime DateOfJoining { get; set; }

    [Range(1, int.MaxValue)]
    public int DepartmentId { get; set; }

    public bool IsActive { get; set; } = true;
}
