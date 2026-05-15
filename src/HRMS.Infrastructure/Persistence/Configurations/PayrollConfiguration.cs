using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRMS.Infrastructure.Persistence.Configurations;

public sealed class PayrollConfiguration : IEntityTypeConfiguration<Payroll>
{
    public void Configure(EntityTypeBuilder<Payroll> builder)
    {
        builder.ToTable("PayrollTransactions");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.PayrollYear)
            .IsRequired();

        builder.Property(x => x.PayrollMonth)
            .IsRequired();

        builder.Property(x => x.GrossPay)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.Deductions)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.NetPay)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.HasIndex(x => new { x.EmployeeId, x.PayrollYear, x.PayrollMonth })
            .IsUnique();
    }
}
