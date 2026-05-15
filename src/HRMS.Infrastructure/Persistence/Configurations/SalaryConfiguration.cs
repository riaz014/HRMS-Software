using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRMS.Infrastructure.Persistence.Configurations;

public sealed class SalaryConfiguration : IEntityTypeConfiguration<Salary>
{
    public void Configure(EntityTypeBuilder<Salary> builder)
    {
        builder.ToTable("Salaries");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.BasicAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.AllowanceAmount)
            .HasPrecision(18, 2)
            .IsRequired();

        builder.Property(x => x.EffectiveFrom)
            .IsRequired();

        builder.HasMany(x => x.Payrolls)
            .WithOne(x => x.Salary)
            .HasForeignKey(x => x.SalaryId)
            .OnDelete(DeleteBehavior.NoAction);
    }
}
