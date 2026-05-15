namespace HRMS.Domain.Entities;

public sealed class Employee : BaseEntity
{
    public string EmployeeNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string ContactNumber { get; set; } = string.Empty;
    public string Position { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string EmploymentStatus { get; set; } = "Active";
    public DateTime DateOfJoining { get; set; }
    public bool IsActive { get; set; } = true;

    public int DepartmentId { get; set; }
    public Department Department { get; set; } = null!;

    public ICollection<Salary> Salaries { get; set; } = new List<Salary>();
    public ICollection<Payroll> Payrolls { get; set; } = new List<Payroll>();
}
