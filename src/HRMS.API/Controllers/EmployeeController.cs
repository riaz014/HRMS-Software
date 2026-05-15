using HRMS.API.DTOs.Employees;
using HRMS.API.Mappings;
using HRMS.API.Auth;
using HRMS.Application.Interfaces.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers;

/// <summary>
/// Manages employee records.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin + "," + Roles.HrManager)]
public sealed class EmployeeController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public EmployeeController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Gets all employees with optional filtering by name or department.
    /// </summary>
    /// <param name="name">Optional employee name filter.</param>
    /// <param name="departmentId">Optional department identifier filter.</param>
    /// <param name="department">Optional department name filter.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Filtered employee list.</returns>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EmployeeResponseDto>>> GetAll(
        [FromQuery] string? name,
        [FromQuery] int? departmentId,
        [FromQuery] string? department,
        CancellationToken cancellationToken)
    {
        var employees = await _unitOfWork.Employees.SearchAsync(name, departmentId, department, cancellationToken);

        return Ok(employees.Select(x => x.ToEmployeeResponseDto()).ToList());
    }

    /// <summary>
    /// Gets an employee by identifier.
    /// </summary>
    /// <param name="id">Employee identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Employee details if found.</returns>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<EmployeeResponseDto>> GetById(int id, CancellationToken cancellationToken)
    {
        var employee = await _unitOfWork.Employees.GetByIdWithDepartmentAsync(id, cancellationToken);

        if (employee is null)
        {
            return NotFound();
        }

        return Ok(employee.ToEmployeeResponseDto());
    }

    /// <summary>
    /// Creates a new employee record.
    /// </summary>
    /// <param name="request">Employee create request payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The created employee.</returns>
    [HttpPost]
    public async Task<ActionResult<EmployeeResponseDto>> Create(
        [FromBody] CreateEmployeeRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!await _unitOfWork.Departments.ExistsAsync(x => x.Id == request.DepartmentId, cancellationToken))
        {
            return BadRequest(new { message = "Invalid DepartmentId." });
        }

        if (await _unitOfWork.Employees.ExistsByEmployeeNumberAsync(request.EmployeeNumber, null, cancellationToken))
        {
            return BadRequest(new { message = "EmployeeNumber already exists." });
        }

        if (await _unitOfWork.Employees.ExistsByEmailAsync(request.Email, null, cancellationToken))
        {
            return BadRequest(new { message = "Email already exists." });
        }

        if (await _unitOfWork.Employees.ExistsByAccountNumberAsync(request.AccountNumber, null, cancellationToken))
        {
            return BadRequest(new { message = "AccountNumber already exists." });
        }

        var employee = request.ToEmployeeEntity();

        await _unitOfWork.Employees.AddAsync(employee, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var createdEmployee = await _unitOfWork.Employees.GetByIdWithDepartmentAsync(employee.Id, cancellationToken);

        return CreatedAtAction(nameof(GetById), new { id = employee.Id }, (createdEmployee ?? employee).ToEmployeeResponseDto());
    }

    /// <summary>
    /// Updates an existing employee record.
    /// </summary>
    /// <param name="id">Employee identifier.</param>
    /// <param name="request">Employee update request payload.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>Updated employee details.</returns>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<EmployeeResponseDto>> Update(
        int id,
        [FromBody] UpdateEmployeeRequestDto request,
        CancellationToken cancellationToken)
    {
        var existingEmployee = await _unitOfWork.Employees.GetByIdAsync(id, cancellationToken);

        if (existingEmployee is null)
        {
            return NotFound();
        }

        if (!await _unitOfWork.Departments.ExistsAsync(x => x.Id == request.DepartmentId, cancellationToken))
        {
            return BadRequest(new { message = "Invalid DepartmentId." });
        }

        if (await _unitOfWork.Employees.ExistsByEmployeeNumberAsync(request.EmployeeNumber, id, cancellationToken))
        {
            return BadRequest(new { message = "EmployeeNumber already exists." });
        }

        if (await _unitOfWork.Employees.ExistsByEmailAsync(request.Email, id, cancellationToken))
        {
            return BadRequest(new { message = "Email already exists." });
        }

        if (await _unitOfWork.Employees.ExistsByAccountNumberAsync(request.AccountNumber, id, cancellationToken))
        {
            return BadRequest(new { message = "AccountNumber already exists." });
        }

        existingEmployee.ApplyUpdate(request);

        _unitOfWork.Employees.Update(existingEmployee);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var updatedEmployee = await _unitOfWork.Employees.GetByIdWithDepartmentAsync(id, cancellationToken);

        return Ok((updatedEmployee ?? existingEmployee).ToEmployeeResponseDto());
    }

    /// <summary>
    /// Deletes an employee record.
    /// </summary>
    /// <param name="id">Employee identifier.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>No content when delete succeeds.</returns>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        var employee = await _unitOfWork.Employees.GetByIdAsync(id, cancellationToken);

        if (employee is null)
        {
            return NotFound();
        }

        _unitOfWork.Employees.Remove(employee);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return NoContent();
    }
}
