using HRMS.API.DTOs.Salary;
using HRMS.API.Mappings;
using HRMS.API.Auth;
using HRMS.Application.Interfaces.Persistence;
using HRMS.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers;

/// <summary>
/// Manages salary records and salary revisions.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin + "," + Roles.HrManager)]
public sealed class SalaryController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public SalaryController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Gets salary records with optional filtering by employee.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<SalaryResponseDto>>> GetAll(
        [FromQuery] int? employeeId,
        CancellationToken cancellationToken)
    {
        IReadOnlyList<Salary> salaries = employeeId.HasValue
            ? await _unitOfWork.Salaries.GetByEmployeeAsync(employeeId.Value, cancellationToken)
            : await _unitOfWork.Salaries.GetAllWithEmployeeAsync(cancellationToken);

        return Ok(salaries.Select(x => x.ToSalaryResponseDto()).ToList());
    }

    /// <summary>
    /// Gets a salary record by identifier.
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<SalaryResponseDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var salary = await _unitOfWork.Salaries.GetByIdWithEmployeeAsync(id, cancellationToken);

        if (salary is null)
        {
            return NotFound();
        }

        return Ok(salary.ToSalaryResponseDto());
    }

    /// <summary>
    /// Creates a salary entry and closes previous active salary for the employee.
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<SalaryResponseDto>> Create(
        [FromBody] CreateSalaryRequestDto request,
        CancellationToken cancellationToken)
    {
        if (request.DeductionAmount > request.BasicAmount + request.AllowanceAmount)
        {
            return BadRequest(new { message = "DeductionAmount cannot exceed base plus allowance." });
        }

        if (!await _unitOfWork.Employees.ExistsAsync(x => x.Id == request.EmployeeId, cancellationToken))
        {
            return BadRequest(new { message = "Invalid EmployeeId." });
        }

        var currentSalary = await _unitOfWork.Salaries.GetCurrentByEmployeeAsync(request.EmployeeId, cancellationToken);

        if (currentSalary is not null)
        {
            if (request.EffectiveFrom <= currentSalary.EffectiveFrom)
            {
                return BadRequest(new { message = "EffectiveFrom must be after the current salary's EffectiveFrom date." });
            }

            currentSalary.EffectiveTo = request.EffectiveFrom.Date.AddDays(-1);
            currentSalary.UpdatedAtUtc = DateTime.UtcNow;
            _unitOfWork.Salaries.Update(currentSalary);
        }

        var salary = request.ToSalaryEntity();
        await _unitOfWork.Salaries.AddAsync(salary, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var createdSalary = await _unitOfWork.Salaries.GetByIdWithEmployeeAsync(salary.Id, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = salary.Id }, (createdSalary ?? salary).ToSalaryResponseDto());
    }

    /// <summary>
    /// Updates an existing salary record.
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<SalaryResponseDto>> Update(
        int id,
        [FromBody] UpdateSalaryRequestDto request,
        CancellationToken cancellationToken)
    {
        var salary = await _unitOfWork.Salaries.GetByIdAsync(id, cancellationToken);

        if (salary is null)
        {
            return NotFound();
        }

        if (request.EffectiveTo.HasValue && request.EffectiveTo.Value < request.EffectiveFrom)
        {
            return BadRequest(new { message = "EffectiveTo cannot be earlier than EffectiveFrom." });
        }

        if (request.DeductionAmount > request.BasicAmount + request.AllowanceAmount)
        {
            return BadRequest(new { message = "DeductionAmount cannot exceed base plus allowance." });
        }

        salary.ApplyUpdate(request);
        _unitOfWork.Salaries.Update(salary);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updatedSalary = await _unitOfWork.Salaries.GetByIdWithEmployeeAsync(id, cancellationToken);
        return Ok((updatedSalary ?? salary).ToSalaryResponseDto());
    }

    /// <summary>
    /// Deletes a salary record.
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var salary = await _unitOfWork.Salaries.GetByIdAsync(id, cancellationToken);

        if (salary is null)
        {
            return NotFound();
        }

        _unitOfWork.Salaries.Remove(salary);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
