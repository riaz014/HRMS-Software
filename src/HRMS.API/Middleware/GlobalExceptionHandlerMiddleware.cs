using System.Net;
using System.Text.Json;

namespace HRMS.API.Middleware;

public sealed class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionHandlerMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlerMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception exception)
        {
            _logger.LogError(exception, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
            await WriteErrorResponseAsync(context, exception);
        }
    }

    private async Task WriteErrorResponseAsync(HttpContext context, Exception exception)
    {
        var (statusCode, message) = MapException(exception);

        var payload = new
        {
            success = false,
            statusCode,
            message,
            traceId = context.TraceIdentifier,
            timestampUtc = DateTime.UtcNow,
            details = _environment.IsDevelopment() ? exception.Message : null
        };

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = statusCode;

        var json = JsonSerializer.Serialize(payload);
        await context.Response.WriteAsync(json);
    }

    private static (int statusCode, string message) MapException(Exception exception)
    {
        return exception switch
        {
            UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized, "Unauthorized access."),
            KeyNotFoundException => ((int)HttpStatusCode.NotFound, "Requested resource was not found."),
            ArgumentException => ((int)HttpStatusCode.BadRequest, exception.Message),
            InvalidOperationException => ((int)HttpStatusCode.BadRequest, exception.Message),
            _ => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred. Please try again later.")
        };
    }
}
