using System.ComponentModel.DataAnnotations;
using TaskBoard.API.Models.Enums;

namespace TaskBoard.API.DTOs;

public class UpdateTaskRequest
{
    [Required]
    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public Priority Priority { get; set; } = Priority.Medium;

    public DateTime? DueDate { get; set; }
}
