using Microsoft.AspNetCore.Mvc;

namespace HRMS.API.Controllers;

/// <summary>
/// Provides health probe endpoints.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public sealed class HealthController : ControllerBase
{
    /// <summary>
    /// Returns API health status.
    /// </summary>
    /// <returns>Simple health status response.</returns>
    [HttpGet]
    public IActionResult Get() => Ok(new { status = "ok" });
}
