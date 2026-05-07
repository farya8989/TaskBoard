using System.ComponentModel.DataAnnotations;

namespace TaskBoard.API.DTOs;

public class UpdateStatusRequest
{
    [Required]
    public TaskBoard.API.Models.Enums.TaskStatus Status { get; set; }
}
