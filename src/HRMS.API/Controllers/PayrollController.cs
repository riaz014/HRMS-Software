using HRMS.API.Auth;
using HRMS.API.DTOs.Payroll;
using HRMS.API.Mappings;
using HRMS.Application.Interfaces.Persistence;
using HRMS.Application.Interfaces.Services;
using HRMS.Application.Models.Payroll;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers;

/// <summary>
/// Provides payroll generation and payroll status endpoints.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.HrManager)]
public sealed class PayrollController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPayrollGenerationService _payrollGenerationService;

    public PayrollController(IUnitOfWork unitOfWork, IPayrollGenerationService payrollGenerationService)
    {
        _unitOfWork = unitOfWork;
        _payrollGenerationService = payrollGenerationService;
    }

    /// <summary>
    /// Gets the most recent payroll transactions.
    /// </summary>
    /// <param name="take">Number of records to return (max 100).</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Recent payroll transaction list.</returns>
    [HttpGet("recent")]
    public async Task<ActionResult<IReadOnlyList<RecentPayrollItemDto>>> GetRecent(
        [FromQuery] int take = 20,
        CancellationToken cancellationToken = default)
    {
        if (take <= 0)
        {
            return BadRequest(new { message = "take must be greater than 0." });
        }

        var payrolls = await _unitOfWork.Payrolls.GetRecentAsync(Math.Min(take, 100), cancellationToken);

        return Ok(payrolls.Select(x => x.ToRecentPayrollItemDto()).ToList());
    }

    /// <summary>
    /// Generates monthly payroll for all active employees.
    /// </summary>
    /// <param name="request">Payroll generation input.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Summary of generated and skipped records.</returns>
    [HttpPost("generate-monthly")]
    public async Task<ActionResult<GenerateMonthlyPayrollResponseDto>> GenerateMonthly(
        [FromBody] GenerateMonthlyPayrollRequestDto request,
        CancellationToken cancellationToken)
    {
        var result = await _payrollGenerationService.GenerateMonthlyPayrollAsync(
            new GenerateMonthlyPayrollRequest
            {
                Year = request.Year,
                Month = request.Month,
                TaxPercentage = request.TaxPercentage,
                AdditionalBonus = request.AdditionalBonus,
                AdditionalDeductions = request.AdditionalDeductions
            },
            cancellationToken);

        return Ok(new GenerateMonthlyPayrollResponseDto
        {
            Year = request.Year,
            Month = request.Month,
            ActiveEmployeesCount = result.ActiveEmployeesCount,
            GeneratedCount = result.GeneratedCount,
            SkippedExistingCount = result.SkippedExistingCount,
            SkippedNoSalaryCount = result.SkippedNoSalaryCount
        });
    }
}
