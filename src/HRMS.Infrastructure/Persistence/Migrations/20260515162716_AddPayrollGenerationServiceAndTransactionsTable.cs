using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRMS.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPayrollGenerationServiceAndTransactionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payrolls_Employees_EmployeeId",
                table: "Payrolls");

            migrationBuilder.DropForeignKey(
                name: "FK_Payrolls_Salaries_SalaryId",
                table: "Payrolls");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Payrolls",
                table: "Payrolls");

            migrationBuilder.RenameTable(
                name: "Payrolls",
                newName: "PayrollTransactions");

            migrationBuilder.RenameIndex(
                name: "IX_Payrolls_SalaryId",
                table: "PayrollTransactions",
                newName: "IX_PayrollTransactions_SalaryId");

            migrationBuilder.RenameIndex(
                name: "IX_Payrolls_EmployeeId_PayrollYear_PayrollMonth",
                table: "PayrollTransactions",
                newName: "IX_PayrollTransactions_EmployeeId_PayrollYear_PayrollMonth");

            migrationBuilder.AddPrimaryKey(
                name: "PK_PayrollTransactions",
                table: "PayrollTransactions",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PayrollTransactions_Employees_EmployeeId",
                table: "PayrollTransactions",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_PayrollTransactions_Salaries_SalaryId",
                table: "PayrollTransactions",
                column: "SalaryId",
                principalTable: "Salaries",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PayrollTransactions_Employees_EmployeeId",
                table: "PayrollTransactions");

            migrationBuilder.DropForeignKey(
                name: "FK_PayrollTransactions_Salaries_SalaryId",
                table: "PayrollTransactions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_PayrollTransactions",
                table: "PayrollTransactions");

            migrationBuilder.RenameTable(
                name: "PayrollTransactions",
                newName: "Payrolls");

            migrationBuilder.RenameIndex(
                name: "IX_PayrollTransactions_SalaryId",
                table: "Payrolls",
                newName: "IX_Payrolls_SalaryId");

            migrationBuilder.RenameIndex(
                name: "IX_PayrollTransactions_EmployeeId_PayrollYear_PayrollMonth",
                table: "Payrolls",
                newName: "IX_Payrolls_EmployeeId_PayrollYear_PayrollMonth");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Payrolls",
                table: "Payrolls",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Payrolls_Employees_EmployeeId",
                table: "Payrolls",
                column: "EmployeeId",
                principalTable: "Employees",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Payrolls_Salaries_SalaryId",
                table: "Payrolls",
                column: "SalaryId",
                principalTable: "Salaries",
                principalColumn: "Id");
        }
    }
}
