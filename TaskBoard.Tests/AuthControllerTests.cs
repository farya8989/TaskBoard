using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using TaskBoard.API.Controllers;
using TaskBoard.API.DTOs;
using TaskBoard.API.Models;
using TaskBoard.Tests.Helpers;

namespace TaskBoard.Tests;

public class AuthControllerTests
{
    private AuthController CreateController(string dbName)
    {
        var db = TestDbHelper.CreateInMemoryDb(dbName);

        var config = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["JwtSettings:SecretKey"] = "SuperSecretTestKeyForJwtTokenGeneration123!",
                ["JwtSettings:Issuer"] = "TaskBoard.API",
                ["JwtSettings:Audience"] = "TaskBoard.Client",
                ["JwtSettings:ExpiryInDays"] = "7"
            })
            .Build();

        return new AuthController(db, config);
    }

    [Fact]
    public async Task Register_WithNewEmail_Returns201()
    {
        var controller = CreateController(nameof(Register_WithNewEmail_Returns201));

        var result = await controller.Register(new RegisterRequest
        {
            Name = "Alice",
            Email = "alice@test.com",
            Password = "password123"
        });

        var created = Assert.IsType<CreatedAtActionResult>(result);
        var response = Assert.IsType<AuthResponse>(created.Value);
        Assert.Equal("alice@test.com", response.Email);
        Assert.False(string.IsNullOrEmpty(response.Token));
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_Returns400()
    {
        var controller = CreateController(nameof(Register_WithDuplicateEmail_Returns400));

        var request = new RegisterRequest
        {
            Name = "Alice",
            Email = "alice@test.com",
            Password = "password123"
        };

        await controller.Register(request);
        var result = await controller.Register(request);

        var bad = Assert.IsType<BadRequestObjectResult>(result);
        Assert.NotNull(bad.Value);
    }

    [Fact]
    public async Task Login_WithValidCredentials_Returns200WithToken()
    {
        var controller = CreateController(nameof(Login_WithValidCredentials_Returns200WithToken));

        await controller.Register(new RegisterRequest
        {
            Name = "Bob",
            Email = "bob@test.com",
            Password = "password123"
        });

        var result = await controller.Login(new LoginRequest
        {
            Email = "bob@test.com",
            Password = "password123"
        });

        var ok = Assert.IsType<OkObjectResult>(result);
        var response = Assert.IsType<AuthResponse>(ok.Value);
        Assert.False(string.IsNullOrEmpty(response.Token));
        Assert.Equal("bob@test.com", response.Email);
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var controller = CreateController(nameof(Login_WithWrongPassword_Returns401));

        await controller.Register(new RegisterRequest
        {
            Name = "Carol",
            Email = "carol@test.com",
            Password = "correctpassword"
        });

        var result = await controller.Login(new LoginRequest
        {
            Email = "carol@test.com",
            Password = "wrongpassword"
        });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }

    [Fact]
    public async Task Login_WithNonExistentEmail_Returns401()
    {
        var controller = CreateController(nameof(Login_WithNonExistentEmail_Returns401));

        var result = await controller.Login(new LoginRequest
        {
            Email = "nobody@test.com",
            Password = "password123"
        });

        Assert.IsType<UnauthorizedObjectResult>(result);
    }
}
