using HRMS.API.Auth;
using HRMS.API.DTOs.Departments;
using HRMS.Application.Interfaces.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers;

/// <summary>
/// Provides department lookup data.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = Roles.Admin + "," + Roles.HrManager)]
public sealed class DepartmentController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;

    public DepartmentController(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Gets all departments ordered by name.
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<DepartmentResponseDto>>> GetAll(CancellationToken cancellationToken)
    {
        var departments = await _unitOfWork.Departments.GetAllAsync(cancellationToken);

        var response = departments
            .OrderBy(x => x.Name)
            .Select(x => new DepartmentResponseDto
            {
                Id = x.Id,
                Name = x.Name
            })
            .ToList();

        return Ok(response);
    }
}