using HRMS.Application.Interfaces.Persistence;
using HRMS.Application.Interfaces.Services;
using HRMS.API.Auth;
using HRMS.API.Middleware;
using HRMS.API.Options;
using HRMS.Infrastructure.DependencyInjection;
using HRMS.Infrastructure.Persistence;
using HRMS.Infrastructure.Persistence.Repositories;
using HRMS.Infrastructure.Security;
using HRMS.Infrastructure.Services;
using HRMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.OpenApi.Models;
using Microsoft.IdentityModel.Tokens;
using System.Reflection;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection(JwtOptions.SectionName));

var jwtOptions = builder.Configuration.GetSection(JwtOptions.SectionName).Get<JwtOptions>()
    ?? throw new InvalidOperationException("JWT settings are not configured.");

if (string.IsNullOrWhiteSpace(jwtOptions.Issuer) ||
    string.IsNullOrWhiteSpace(jwtOptions.Audience) ||
    string.IsNullOrWhiteSpace(jwtOptions.Key))
{
    throw new InvalidOperationException("JWT issuer, audience, and key must be configured.");
}

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "http://localhost:3000", "http://192.168.0.170:4200")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "HRMS API",
        Version = "v1",
        Description = "Human Resource Management System API"
    });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);

    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath, includeControllerXmlComments: true);
    }

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token. Example: Bearer {token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidAudience = jwtOptions.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ClockSkew = TimeSpan.Zero
        };
    });
builder.Services.AddAuthorization();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<ISalaryRepository, SalaryRepository>();
builder.Services.AddScoped<IPayrollRepository, PayrollRepository>();
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IPayrollGenerationService, PayrollGenerationService>();
builder.Services.AddScoped<ITokenService, JwtTokenService>();
builder.Services.AddSingleton<IAuthUserStore, InMemoryAuthUserStore>();

var app = builder.Build();

await EnsureDepartmentCatalogAsync(app);

app.UseGlobalExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // Skip HTTPS redirection in development to allow HTTP access
}
else
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

static async Task EnsureDepartmentCatalogAsync(WebApplication app)
{
    await using var scope = app.Services.CreateAsyncScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

    if (!await dbContext.Database.CanConnectAsync())
    {
        return;
    }

    var requiredDepartments = new[]
    {
        new Department { Name = "Faculty", Description = "Academic faculty and teaching staff." },
        new Department { Name = "Software Development", Description = "University software systems and development team." },
        new Department { Name = "Human Resources", Description = "Recruitment, employee relations, and HR operations." },
        new Department { Name = "Administration", Description = "Administrative support and office management." },
        new Department { Name = "Admissions and Records", Description = "Admissions processing and student records management." },
        new Department { Name = "Finance and Accounts", Description = "Budgeting, payroll finance, and accounting operations." },
        new Department { Name = "IT Services", Description = "Campus IT infrastructure, helpdesk, and operations." },
        new Department { Name = "Library Services", Description = "Library operations and academic resource services." },
        new Department { Name = "Student Affairs", Description = "Student support services, wellbeing, and engagement." },
        new Department { Name = "Research and Innovation", Description = "Research programs, grants, and innovation management." },
        new Department { Name = "Facilities and Maintenance", Description = "Campus facilities, maintenance, and infrastructure upkeep." },
        new Department { Name = "Procurement", Description = "Purchasing, vendor management, and procurement compliance." },
        new Department { Name = "Quality Assurance", Description = "Academic and administrative quality assurance activities." },
        new Department { Name = "Examination Cell", Description = "Examination scheduling, processing, and result management." }
    };

    var existingNames = await dbContext.Departments
        .AsNoTracking()
        .Select(x => x.Name)
        .ToListAsync();

    var existingNameSet = existingNames
        .Select(x => x.Trim())
        .ToHashSet(StringComparer.OrdinalIgnoreCase);

    var missingDepartments = requiredDepartments
        .Where(x => !existingNameSet.Contains(x.Name))
        .ToList();

    if (missingDepartments.Count == 0)
    {
        return;
    }

    await dbContext.Departments.AddRangeAsync(missingDepartments);
    await dbContext.SaveChangesAsync();
}
