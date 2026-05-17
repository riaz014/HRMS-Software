using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRMS.Infrastructure.Persistence.Configurations;

public sealed class AuthUserConfiguration : IEntityTypeConfiguration<AuthUser>
{
    public void Configure(EntityTypeBuilder<AuthUser> builder)
    {
        builder.ToTable("AuthUsers");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Username)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Password)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(x => x.Role)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.Username)
            .IsUnique();
    }
}