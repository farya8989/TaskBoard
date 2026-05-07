using System.ComponentModel.DataAnnotations;
using TaskBoard.API.Models.Enums;

namespace TaskBoard.API.Models;

public class TaskItem
{
    public int Id { get; set; }

    [Required]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public Priority Priority { get; set; } = Priority.Medium;

    public Enums.TaskStatus Status { get; set; } = Enums.TaskStatus.Todo;

    public DateTime? DueDate { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }

    public User User { get; set; } = null!;
}
