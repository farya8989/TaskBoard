# TaskBoard Project

## What This Project Is
A full-stack Task Board app where users can create tasks, set priorities, and move them across To Do → In Progress → Done.

## Tech Stack
- Backend: ASP.NET Core Web API (.NET 8)
- Database: SQL Server with Entity Framework Core
- Frontend: React + Redux Toolkit + Tailwind CSS v3
- Auth: JWT Bearer Tokens

## Project Structure
TaskBoard/
├── TaskBoard.API/        ← .NET 8 Backend (COMPLETE)
├── TaskBoard.Tests/      ← xUnit Backend Tests (COMPLETE)
└── taskboard-client/     ← React Frontend (COMPLETE)

## Commands

### Backend (run from `TaskBoard.API/`)
```bash
dotnet run                        # Start API on http://localhost:5130
dotnet watch run                  # Hot-reload dev server
dotnet build                      # Build project
dotnet ef migrations add <Name>   # Add EF Core migration
dotnet ef database update         # Apply migrations to SQL Server
```

### Backend Tests (run from `TaskBoard.Tests/`)
```bash
dotnet test                                          # Run all tests
dotnet test --logger "console;verbosity=normal"      # Run with detailed output
```

### Frontend (run from `taskboard-client/`)
```bash
npm start                  # Dev server on http://localhost:3000
npm test                   # Run all Jest tests (49 tests)
npm test -- --watchAll=false   # Run once without watch mode
npm run build              # Production build
```

## Current Status
**Backend: COMPLETE** — API on `http://localhost:5130`, Swagger at `http://localhost:5130/swagger`
**Frontend: COMPLETE** — App on `http://localhost:3000`
**Tests: COMPLETE** — 15 backend + 49 frontend = 64 tests, all passing

---

## Backend — File Structure
```
TaskBoard.API/
├── Controllers/
│   ├── AuthController.cs       # POST /api/auth/register, /api/auth/login
│   └── TasksController.cs      # GET/POST/PUT/DELETE /api/tasks, PATCH /api/tasks/{id}/status
├── Data/
│   └── AppDbContext.cs         # EF Core DbContext, enum→string conversions, unique email index
├── DTOs/
│   ├── RegisterRequest.cs      # Name, Email, Password (min 6)
│   ├── LoginRequest.cs         # Email, Password
│   ├── AuthResponse.cs         # Token, UserId, Name, Email
│   ├── CreateTaskRequest.cs    # Title (required), Description?, Priority, DueDate?
│   ├── UpdateTaskRequest.cs    # Same as Create
│   ├── UpdateStatusRequest.cs  # Status enum
│   └── TaskResponse.cs         # All task fields; Priority+Status returned as strings
├── Migrations/
│   └── 20260507043424_InitialCreate.cs
├── Models/
│   ├── Enums/
│   │   ├── Priority.cs         # Low, Medium, High
│   │   └── TaskStatus.cs       # Todo, InProgress, Done
│   ├── User.cs
│   └── TaskItem.cs
├── appsettings.json            # ConnectionStrings + JwtSettings
└── Program.cs                  # DI, CORS, JWT middleware, JsonStringEnumConverter, Swagger
```

## Backend Tests — File Structure
```
TaskBoard.Tests/
├── Helpers/
│   ├── TestDbHelper.cs         # Creates in-memory AppDbContext per test
│   └── FakeUser.cs             # Injects fake JWT claims into controller context
├── AuthControllerTests.cs      # 5 tests: register, login, duplicates, wrong credentials
└── TasksControllerTests.cs     # 10 tests: CRUD, ownership, filter, search
```

**Test coverage:**
| Suite | Tests | What's covered |
|---|---|---|
| AuthControllerTests | 5 | Register 201, duplicate 400, login 200+JWT, wrong password 401, unknown email 401 |
| TasksControllerTests | 10 | GetAll scoped to user, filter by priority, search by title, Create 201, Update 200/403, Delete 204/404, UpdateStatus 200/403 |

## API Endpoints
| Method | Route | Auth | Response |
|---|---|---|---|
| POST | `/api/auth/register` | No | 201 + JWT, 400 duplicate email |
| POST | `/api/auth/login` | No | 200 + JWT, 401 wrong credentials |
| GET | `/api/tasks` | Yes | 200 list — supports `?priority=High&search=title` |
| POST | `/api/tasks` | Yes | 201, 400 missing title |
| PUT | `/api/tasks/{id}` | Yes | 200, 403 wrong user, 404 not found |
| DELETE | `/api/tasks/{id}` | Yes | 204, 404 not found |
| PATCH | `/api/tasks/{id}/status` | Yes | 200, 400 invalid status |

---

## Frontend — File Structure
```
taskboard-client/src/
├── api/
│   └── axios.js               # Axios instance (baseURL + JWT interceptor)
├── store/
│   ├── index.js               # Redux store
│   ├── authSlice.js           # register/login thunks, logout, localStorage persistence
│   └── tasksSlice.js          # fetchTasks, createTask, updateTask, deleteTask, updateStatus
├── components/
│   ├── Auth/
│   │   ├── Login.jsx          # Login form, redirects to /board on success
│   │   └── Register.jsx       # Register form, redirects to /board on success
│   ├── Board/
│   │   ├── Board.jsx          # Fetches tasks, search+filter bar, 3 columns, opens TaskForm
│   │   └── Column.jsx         # Column header with count badge, lists TaskCards
│   ├── Task/
│   │   ├── TaskCard.jsx       # Title, priority badge, due date, ←→ move, Edit/Delete
│   │   └── TaskForm.jsx       # Modal for create and edit
│   └── shared/
│       └── Navbar.jsx         # App title, user name, logout
├── __tests__/                 # All test files — separated from source
│   ├── test-utils.jsx         # renderWithProviders helper (Provider + MemoryRouter)
│   ├── App.test.js
│   ├── store/
│   │   ├── authSlice.test.js
│   │   └── tasksSlice.test.js
│   └── components/
│       ├── Auth/
│       │   ├── Login.test.jsx
│       │   └── Register.test.jsx
│       └── Task/
│           ├── TaskCard.test.jsx
│           └── TaskForm.test.jsx
├── App.js                     # Routes: /login, /register, /board (PrivateRoute guard)
└── index.js                   # Redux Provider wraps App
```

## Frontend Tests — Coverage
| File | Tests | What's covered |
|---|---|---|
| authSlice.test.js | 7 | logout, clearError, login/register fulfilled/pending/rejected reducers |
| tasksSlice.test.js | 9 | clearTaskError, fetch/create/update/delete/updateStatus reducers |
| Login.test.jsx | 6 | Fields render, button, error display, loading state, input change |
| Register.test.jsx | 6 | Fields render, button, error display, loading state, input change |
| TaskCard.test.jsx | 9 | Title, badge, description, move buttons per status, overdue, Edit callback |
| TaskForm.test.jsx | 10 | Create/edit headings, pre-fill, default priority, buttons, Cancel, input change |
| App.test.js | 2 | Unauthenticated → login redirect, authenticated → board |

## Frontend Data Flow
```
User action (e.g. create task)
    │
    ▼
Component dispatches Redux thunk (createTask)
    │
    ▼
tasksSlice → api/axios.js → POST /api/tasks
    │            (JWT auto-attached via interceptor)
    ▼
On success: task prepended to state.tasks.items
On error:   extractError() converts ProblemDetails → plain string → state.tasks.error
    │
    ▼
Component re-renders from Redux state
```

## Important Technical Decisions

### Backend
- `TaskStatus` must always use fully qualified name `TaskBoard.API.Models.Enums.TaskStatus` — conflicts with `System.Threading.Tasks.TaskStatus`
- Enums stored as strings in DB via `.HasConversion<string>()` in `AppDbContext`
- `JsonStringEnumConverter` registered globally in `Program.cs` — API accepts `"Low"/"Medium"/"High"` and `"Todo"/"InProgress"/"Done"` as JSON strings
- Passwords hashed with BCrypt — never stored plain
- JWT claims: `ClaimTypes.NameIdentifier` = UserId, `ClaimTypes.Email`, `ClaimTypes.Name`
- JWT expiry: 7 days — read from `JwtSettings:ExpiryInDays` in appsettings
- CORS allows `http://localhost:3000` with any header/method
- Task ownership enforced in every endpoint — 403 if `task.UserId != userId`
- Nullable reference types enabled — use `null!` for required navigation properties

### Frontend
- JWT token + user object persisted in `localStorage` — Redux state rehydrated from it on page load
- `extractError()` in both slices normalises all API errors (plain string, ProblemDetails, validation errors) to a string before storing in Redux — prevents "Objects are not valid as React child" crash
- Tailwind downgraded from v4 → v3 — v4 is not compatible with react-scripts without ejecting
- `PrivateRoute` in `App.js` redirects unauthenticated users to `/login`
- Search and priority filter trigger `fetchTasks` via `useEffect` on state change (live re-fetch)
- TaskCard move buttons: Todo→InProgress→Done and back using `PATCH /api/tasks/{id}/status`

### Testing
- Backend uses `Microsoft.EntityFrameworkCore.InMemory` — each test gets its own named DB to avoid state bleed between tests
- `FakeUser.cs` helper injects `ClaimsPrincipal` directly into controller `HttpContext` to simulate JWT auth without a real token
- Frontend component tests mock `api/axios` to prevent real HTTP calls
- `react-router-dom` v7 requires `moduleNameMapper` in `package.json` to resolve CJS builds — CRA's Jest can't resolve its conditional package exports
- `TextEncoder`/`TextDecoder` polyfilled in `setupTests.js` — required by react-router v7's CJS build in jsdom
- `testMatch` in `package.json` scoped to `*.test.*` files only — prevents `test-utils.jsx` from being treated as a test suite
- `App.test.js` uses a custom `renderApp()` (Provider only, no MemoryRouter) because `App.js` already contains `<BrowserRouter>`

## NuGet Packages (TaskBoard.API)
| Package | Version | Purpose |
|---|---|---|
| BCrypt.Net-Next | 4.1.0 | Password hashing |
| Microsoft.AspNetCore.Authentication.JwtBearer | 8.0.13 | JWT auth |
| Microsoft.EntityFrameworkCore.SqlServer | 8.0.13 | EF Core + SQL Server |
| Microsoft.EntityFrameworkCore.Tools | 8.0.13 | EF migrations CLI |
| Swashbuckle.AspNetCore | 6.6.2 | Swagger UI |

## NuGet Packages (TaskBoard.Tests)
| Package | Version | Purpose |
|---|---|---|
| xunit | (latest) | Test framework |
| Moq | 4.20.72 | Mocking library |
| Microsoft.EntityFrameworkCore.InMemory | 8.0.13 | In-memory DB for tests |

## npm Packages (taskboard-client)
| Package | Purpose |
|---|---|
| @reduxjs/toolkit | State management + async thunks |
| react-redux | React-Redux bindings |
| react-router-dom v7 | Client-side routing |
| axios | HTTP client — JWT auto-attached via interceptor |
| tailwindcss v3 | Utility CSS framework |
| postcss + autoprefixer | Required by Tailwind v3 with CRA |
