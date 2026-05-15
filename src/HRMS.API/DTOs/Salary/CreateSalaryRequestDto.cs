using System.ComponentModel.DataAnnotations;

namespace HRMS.API.DTOs.Salary;

public sealed class CreateSalaryRequestDto
{
    [Range(1, int.MaxValue)]
    public int EmployeeId { get; set; }

    [Range(typeof(decimal), "0.01", "999999999")]
    public decimal BasicAmount { get; set; }

    [Range(typeof(decimal), "0", "999999999")]
    public decimal AllowanceAmount { get; set; }

    [Range(typeof(decimal), "0", "999999999")]
    public decimal DeductionAmount { get; set; }

    [Required]
    public DateTime EffectiveFrom { get; set; }
}
