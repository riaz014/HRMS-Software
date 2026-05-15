namespace HRMS.Domain.Entities;

public sealed class Salary : BaseEntity
{
    public int EmployeeId { get; set; }
    public decimal BasicAmount { get; set; }
    public decimal AllowanceAmount { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }

    public Employee Employee { get; set; } = null!;
    public ICollection<Payroll> Payrolls { get; set; } = new List<Payroll>();
}
