using TaskBoard.API.Models.Enums;

namespace TaskBoard.API.DTOs;

public class TaskResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = null!;
    public string? Description { get; set; }
    public string Priority { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; }
    public int UserId { get; set; }
}
