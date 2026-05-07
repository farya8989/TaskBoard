using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskBoard.API.Data;
using TaskBoard.API.DTOs;
using TaskBoard.API.Models;
using TaskBoard.API.Models.Enums;

namespace TaskBoard.API.Controllers;

[ApiController]
[Route("api/tasks")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _db;

    public TasksController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] Priority? priority, [FromQuery] string? search)
    {
        var userId = GetUserId();

        var query = _db.Tasks.Where(t => t.UserId == userId);

        if (priority.HasValue)
            query = query.Where(t => t.Priority == priority.Value);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(t => t.Title.Contains(search));

        var tasks = await query
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => ToResponse(t))
            .ToListAsync();

        return Ok(tasks);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateTaskRequest request)
    {
        var userId = GetUserId();

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            DueDate = request.DueDate,
            UserId = userId
        };

        _db.Tasks.Add(task);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new { id = task.Id }, ToResponse(task));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, UpdateTaskRequest request)
    {
        var userId = GetUserId();
        var task = await _db.Tasks.FindAsync(id);

        if (task is null) return NotFound();
        if (task.UserId != userId) return Forbid();

        task.Title = request.Title;
        task.Description = request.Description;
        task.Priority = request.Priority;
        task.DueDate = request.DueDate;

        await _db.SaveChangesAsync();
        return Ok(ToResponse(task));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var task = await _db.Tasks.FindAsync(id);

        if (task is null) return NotFound();
        if (task.UserId != userId) return Forbid();

        _db.Tasks.Remove(task);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateStatusRequest request)
    {
        if (!Enum.IsDefined(typeof(TaskBoard.API.Models.Enums.TaskStatus), request.Status))
            return BadRequest("Invalid status value.");

        var userId = GetUserId();
        var task = await _db.Tasks.FindAsync(id);

        if (task is null) return NotFound();
        if (task.UserId != userId) return Forbid();

        task.Status = request.Status;
        await _db.SaveChangesAsync();
        return Ok(ToResponse(task));
    }

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static TaskResponse ToResponse(TaskItem t) => new()
    {
        Id = t.Id,
        Title = t.Title,
        Description = t.Description,
        Priority = t.Priority.ToString(),
        Status = t.Status.ToString(),
        DueDate = t.DueDate,
        CreatedAt = t.CreatedAt,
        UserId = t.UserId
    };
}
