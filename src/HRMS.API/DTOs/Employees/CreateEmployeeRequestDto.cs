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
    [StringLength(30)]
    [Phone]
    public string ContactNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(100)]
    public string Position { get; set; } = string.Empty;

    [Required]
    [StringLength(50)]
    public string AccountNumber { get; set; } = string.Empty;

    [Required]
    [StringLength(30)]
    public string EmploymentStatus { get; set; } = "Active";

    [Required]
    public DateTime DateOfJoining { get; set; }

    [Range(1, int.MaxValue)]
    public int DepartmentId { get; set; }
}
