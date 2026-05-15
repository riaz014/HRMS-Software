# HRMS - System Setup and Architecture

This repository contains an HRMS solution with:

- .NET 8 Web API using Clean Architecture and EF Core (Code First)
- JWT authentication with role-based authorization
- Angular 18 frontend with standalone components and Angular Material

## System Architecture (Mermaid)

```mermaid
flowchart LR
      A[Angular 18 App\nhrms-web] -->|HTTP + JWT| B[ASP.NET Core API\nHRMS.API]

      subgraph FE[Frontend - Angular]
         A1[Employee Management\nMaterial Table + Dialog]
         A2[Payroll Dashboard\nGenerate + Recent + PDF]
         A3[ApiService + AuthInterceptor\nToastService]
         A --> A1
         A --> A2
         A --> A3
      end

      subgraph API[Backend - .NET 8]
         B1[Controllers\nAuth / Employee / Payroll]
         B2[Global Exception Middleware]
         B3[JWT Auth + Role Policies\nAdmin, HR_Manager]
         B4[Services\nPayrollGenerationService, JwtTokenService]
         B5[Repositories + UnitOfWork\nGenericRepository, EmployeeRepository, PayrollRepository]
         B6[ApplicationDbContext + EF Configurations]
         B --> B2 --> B1
         B1 --> B3
         B1 --> B4
         B4 --> B5
         B1 --> B5
         B5 --> B6
      end

      subgraph DB[Data Layer]
         C[(SQL Server / LocalDB)]
         C1[Tables\nDepartments\nEmployees\nSalaries\nPayrollTransactions]
         C --> C1
      end

      B6 --> C
```

## Database Schema (Mermaid ERD)

```mermaid
erDiagram
   DEPARTMENTS ||--o{ EMPLOYEES : has
   EMPLOYEES ||--o{ SALARIES : has
   EMPLOYEES ||--o{ PAYROLL_TRANSACTIONS : receives
   SALARIES ||--o{ PAYROLL_TRANSACTIONS : used_for

   DEPARTMENTS {
      int Id PK
      string Name
      datetime CreatedAtUtc
      datetime UpdatedAtUtc
   }

   EMPLOYEES {
      int Id PK
      string EmployeeNumber UK
      string FirstName
      string LastName
      string Email UK
      string ContactNumber
      string Position
      string AccountNumber UK
      string EmploymentStatus
      date DateOfJoining
      bool IsActive
      int DepartmentId FK
      datetime CreatedAtUtc
      datetime UpdatedAtUtc
   }

   SALARIES {
      int Id PK
      int EmployeeId FK
      decimal BasicAmount
      decimal AllowanceAmount
      decimal DeductionAmount
      date EffectiveFrom
      date EffectiveTo
      datetime CreatedAtUtc
      datetime UpdatedAtUtc
   }

   PAYROLL_TRANSACTIONS {
      int Id PK
      int EmployeeId FK
      int SalaryId FK
      int PayrollYear
      int PayrollMonth
      decimal GrossPay
      decimal Deductions
      decimal NetPay
      datetime ProcessedAtUtc
      datetime CreatedAtUtc
      datetime UpdatedAtUtc
   }
```

## Project Structure

- src/HRMS.Domain: Entities and core domain models.
- src/HRMS.Application: Interfaces and application contracts.
- src/HRMS.Infrastructure: EF Core, repositories, services, and persistence.
- src/HRMS.API: Web API host, controllers, middleware, auth configuration.
- hrms-web: Angular frontend app.

## Prerequisites

- .NET SDK 8.x
- Node.js 20+
- npm 10+
- SQL Server or LocalDB

## 1) Database Setup

### Configure connection string

Edit the connection string in [src/HRMS.API/appsettings.json](src/HRMS.API/appsettings.json):

- ConnectionStrings:DefaultConnection

### Apply migrations

Run from repository root:

```powershell
dotnet ef database update --project src/HRMS.Infrastructure/HRMS.Infrastructure.csproj --startup-project src/HRMS.API/HRMS.API.csproj --context ApplicationDbContext
```

If you need to create a new migration:

```powershell
dotnet ef migrations add <MigrationName> --project src/HRMS.Infrastructure/HRMS.Infrastructure.csproj --startup-project src/HRMS.API/HRMS.API.csproj --context ApplicationDbContext --output-dir Persistence/Migrations
```

## 2) Run the .NET API

From repository root:

```powershell
dotnet restore HRMS.sln
dotnet build HRMS.sln
dotnet run --project src/HRMS.API/HRMS.API.csproj
```

Default API base URL is typically:

- https://localhost:5001

Swagger (Development):

- https://localhost:5001/swagger

## 3) Start the Angular App

From [hrms-web](hrms-web):

```powershell
npm install
npm start
```

Angular app default URL:

- http://localhost:4200

API base URL for frontend is configured in [hrms-web/src/environments/environment.ts](hrms-web/src/environments/environment.ts).

## Authentication and Roles

JWT settings and demo users are in [src/HRMS.API/appsettings.json](src/HRMS.API/appsettings.json):

- Jwt section: Issuer, Audience, Key, ExpiresInMinutes
- AuthUsers section:
   - Admin
   - HR_Manager

Login endpoint:

- POST /api/auth/login

Protected modules:

- Employee endpoints: Admin, HR_Manager
- Salary endpoints: Admin, HR_Manager
- Payroll endpoints: HR_Manager

## Key Implemented Modules

- Employee Management (add/edit/delete, search/filter, department mapping, contact details, position, account number, employment status).
- Salary Management (salary revisions with effective dates, bonuses/allowances, fixed deductions, validation checks).
- Payroll Dashboard (generate monthly payroll, tax and deduction calculations, recent payments list, period summary report, export payslip PDF).
- Global API exception handling for consistent error responses.
- Repository Pattern + Unit of Work in backend.

## Troubleshooting

- If JWT requests fail with 401:
   - Verify token is present in local storage and interceptor attaches Authorization header.
   - Verify Jwt settings (issuer/audience/key) match token generation and validation.
- If database update fails:
   - Recheck connection string and SQL Server/LocalDB availability.
- If Angular build shows budget warnings:
   - This is currently expected with Material + PDF dependencies; app still builds and runs.
