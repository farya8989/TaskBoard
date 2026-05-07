using Microsoft.EntityFrameworkCore;
using TaskBoard.API.Data;

namespace TaskBoard.Tests.Helpers;

public static class TestDbHelper
{
    public static AppDbContext CreateInMemoryDb(string dbName)
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(dbName)
            .Options;

        return new AppDbContext(options);
    }
}
