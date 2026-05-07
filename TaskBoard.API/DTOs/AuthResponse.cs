namespace TaskBoard.API.DTOs;

public class AuthResponse
{
    public string Token { get; set; } = null!;
    public int UserId { get; set; }
    public string Name { get; set; } = null!;
    public string Email { get; set; } = null!;
}
