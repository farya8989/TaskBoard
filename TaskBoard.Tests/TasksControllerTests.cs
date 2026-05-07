using Microsoft.AspNetCore.Mvc;
using TaskBoard.API.Controllers;
using TaskBoard.API.Data;
using TaskBoard.API.DTOs;
using TaskBoard.API.Models;
using TaskBoard.API.Models.Enums;
using TaskBoard.Tests.Helpers;

namespace TaskBoard.Tests;

public class TasksControllerTests
{
    private async Task<(TasksController controller, AppDbContext db, int userId)> SetupAsync(string dbName)
    {
        var db = TestDbHelper.CreateInMemoryDb(dbName);

        var user = new User
        {
            Name = "Test User",
            Email = "test@test.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("password")
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        var controller = new TasksController(db);
        FakeUser.SetUser(controller, user.Id);

        return (controller, db, user.Id);
    }

    [Fact]
    public async Task GetAll_ReturnsOnlyCurrentUserTasks()
    {
        var (controller, db, userId) = await SetupAsync(nameof(GetAll_ReturnsOnlyCurrentUserTasks));

        var otherUser = new User { Name = "Other", Email = "other@test.com", PasswordHash = "x" };
        db.Users.Add(otherUser);
        await db.SaveChangesAsync();

        db.Tasks.AddRange(
            new TaskItem { Title = "My Task", UserId = userId },
            new TaskItem { Title = "Their Task", UserId = otherUser.Id }
        );
        await db.SaveChangesAsync();

        var result = await controller.GetAll(null, null);

        var ok = Assert.IsType<OkObjectResult>(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<TaskResponse>>(ok.Value);
        Assert.Single(tasks);
        Assert.Equal("My Task", tasks.First().Title);
    }

    [Fact]
    public async Task Create_WithTitle_Returns201()
    {
        var (controller, _, _) = await SetupAsync(nameof(Create_WithTitle_Returns201));

        var result = await controller.Create(new CreateTaskRequest
        {
            Title = "New Task",
            Priority = Priority.High
        });

        var created = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<TaskResponse>(created.Value);
        Assert.Equal("New Task", response.Title);
        Assert.Equal("High", response.Priority);
        Assert.Equal("Todo", response.Status);
    }

    [Fact]
    public async Task Update_WithCorrectUser_Returns200()
    {
        var (controller, db, userId) = await SetupAsync(nameof(Update_WithCorrectUser_Returns200));

        var task = new TaskItem { Title = "Old Title", UserId = userId };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var result = await controller.Update(task.Id, new UpdateTaskRequest
        {
            Title = "Updated Title",
            Priority = Priority.Low
        });

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<TaskResponse>(ok.Value);
        Assert.Equal("Updated Title", response.Title);
    }

    [Fact]
    public async Task Update_WithWrongUser_Returns403()
    {
        var (controller, db, _) = await SetupAsync(nameof(Update_WithWrongUser_Returns403));

        var otherUser = new User { Name = "Other", Email = "other@test.com", PasswordHash = "x" };
        db.Users.Add(otherUser);
        await db.SaveChangesAsync();

        var task = new TaskItem { Title = "Their Task", UserId = otherUser.Id };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var result = await controller.Update(task.Id, new UpdateTaskRequest
        {
            Title = "Hacked",
            Priority = Priority.Low
        });

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task Delete_ExistingTask_Returns204()
    {
        var (controller, db, userId) = await SetupAsync(nameof(Delete_ExistingTask_Returns204));

        var task = new TaskItem { Title = "To Delete", UserId = userId };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var result = await controller.Delete(task.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.False(db.Tasks.Any(t => t.Id == task.Id));
    }

    [Fact]
    public async Task Delete_NonExistentTask_Returns404()
    {
        var (controller, _, _) = await SetupAsync(nameof(Delete_NonExistentTask_Returns404));

        var result = await controller.Delete(9999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task UpdateStatus_ValidStatus_Returns200()
    {
        var (controller, db, userId) = await SetupAsync(nameof(UpdateStatus_ValidStatus_Returns200));

        var task = new TaskItem { Title = "Task", UserId = userId, Status = TaskBoard.API.Models.Enums.TaskStatus.Todo };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var result = await controller.UpdateStatus(task.Id, new UpdateStatusRequest
        {
            Status = TaskBoard.API.Models.Enums.TaskStatus.InProgress
        });

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<TaskResponse>(ok.Value);
        Assert.Equal("InProgress", response.Status);
    }

    [Fact]
    public async Task UpdateStatus_WithWrongUser_Returns403()
    {
        var (controller, db, _) = await SetupAsync(nameof(UpdateStatus_WithWrongUser_Returns403));

        var otherUser = new User { Name = "Other", Email = "other@test.com", PasswordHash = "x" };
        db.Users.Add(otherUser);
        await db.SaveChangesAsync();

        var task = new TaskItem { Title = "Their Task", UserId = otherUser.Id };
        db.Tasks.Add(task);
        await db.SaveChangesAsync();

        var result = await controller.UpdateStatus(task.Id, new UpdateStatusRequest
        {
            Status = TaskBoard.API.Models.Enums.TaskStatus.Done
        });

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task GetAll_FilterByPriority_ReturnsFilteredTasks()
    {
        var (controller, db, userId) = await SetupAsync(nameof(GetAll_FilterByPriority_ReturnsFilteredTasks));

        db.Tasks.AddRange(
            new TaskItem { Title = "High Task", Priority = Priority.High, UserId = userId },
            new TaskItem { Title = "Low Task", Priority = Priority.Low, UserId = userId }
        );
        await db.SaveChangesAsync();

        var result = await controller.GetAll(Priority.High, null);

        var ok = Assert.IsType<OkObjectResult>(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<TaskResponse>>(ok.Value);
        Assert.Single(tasks);
        Assert.Equal("High Task", tasks.First().Title);
    }

    [Fact]
    public async Task GetAll_SearchByTitle_ReturnsMatchingTasks()
    {
        var (controller, db, userId) = await SetupAsync(nameof(GetAll_SearchByTitle_ReturnsMatchingTasks));

        db.Tasks.AddRange(
            new TaskItem { Title = "Fix login bug", UserId = userId },
            new TaskItem { Title = "Update UI", UserId = userId }
        );
        await db.SaveChangesAsync();

        var result = await controller.GetAll(null, "login");

        var ok = Assert.IsType<OkObjectResult>(result);
        var tasks = Assert.IsAssignableFrom<IEnumerable<TaskResponse>>(ok.Value);
        Assert.Single(tasks);
        Assert.Equal("Fix login bug", tasks.First().Title);
    }
}
