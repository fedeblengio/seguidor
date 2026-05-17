# Seguidor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a multi-tenant CRM SaaS for small businesses to track clients, follow-ups, and convert more leads into sales.

**Architecture:** Laravel 11 API + React SPA (Vite). Multi-tenant via `tenant_id` column with middleware auto-scoping. Sanctum cookie-based auth. Redis for cache/queue.

**Tech Stack:** Laravel 11, PHP 8.3, React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, MySQL 8, Redis, Docker Compose.

---

### Task 1: Project Scaffolding — Laravel API

**Files:**
- Create: `api/` (Laravel project)
- Create: `api/.env.example`

**Step 1: Create Laravel project**

Run:
```bash
cd C:/Users/Federico/Documents/Github/seguidor
composer create-project laravel/laravel api
```

**Step 2: Remove unnecessary frontend scaffolding**

Run:
```bash
cd api
rm -rf resources/js resources/css vite.config.js package.json
```

**Step 3: Install dependencies**

Run:
```bash
cd api
composer require laravel/sanctum
```

**Step 4: Configure .env.example**

Set these values in `api/.env.example`:
```
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=seguidor
DB_USERNAME=seguidor
DB_PASSWORD=secret

CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=redis

SANCTUM_STATEFUL_DOMAINS=localhost:5173
SESSION_DOMAIN=localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

**Step 5: Configure CORS in `api/config/cors.php`**

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => [env('CORS_ALLOWED_ORIGINS', 'http://localhost:5173')],
'supports_credentials' => true,
```

**Step 6: Commit**

```bash
git add api/
git commit -m "feat: scaffold Laravel API with Sanctum"
```

---

### Task 2: Project Scaffolding — React Frontend

**Files:**
- Create: `web/` (React + Vite project)

**Step 1: Create React project with Vite**

Run:
```bash
cd C:/Users/Federico/Documents/Github/seguidor
npm create vite@latest web -- --template react-ts
```

**Step 2: Install dependencies**

Run:
```bash
cd web
npm install
npm install -D tailwindcss @tailwindcss/vite
npm install @tanstack/react-query react-router-dom axios
```

**Step 3: Configure Tailwind in `web/vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
  },
})
```

**Step 4: Add Tailwind import to `web/src/index.css`**

```css
@import "tailwindcss";
```

**Step 5: Setup base `web/src/App.tsx`**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <h1 className="text-2xl p-4">Seguidor</h1>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
```

**Step 6: Commit**

```bash
git add web/
git commit -m "feat: scaffold React frontend with Vite, Tailwind, TanStack Query"
```

---

### Task 3: Docker Compose Setup

**Files:**
- Create: `docker-compose.yml`
- Create: `api/Dockerfile`
- Create: `web/Dockerfile`
- Create: `docker/nginx/api.conf`

**Step 1: Create `docker-compose.yml`**

```yaml
services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "8000:80"
    volumes:
      - ./api:/var/www/html
    depends_on:
      - mysql
      - redis
    environment:
      - DB_HOST=mysql
      - REDIS_HOST=redis

  web:
    build:
      context: ./web
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    volumes:
      - ./web:/app
      - /app/node_modules

  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: seguidor
      MYSQL_USER: seguidor
      MYSQL_PASSWORD: secret
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  mysql_data:
```

**Step 2: Create `api/Dockerfile`**

```dockerfile
FROM php:8.3-fpm

RUN apt-get update && apt-get install -y \
    nginx git unzip libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd \
    && pecl install redis && docker-php-ext-enable redis

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY . .
RUN composer install --no-dev --optimize-autoloader

COPY ../docker/nginx/api.conf /etc/nginx/sites-available/default

EXPOSE 80
CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
```

**Step 3: Create `web/Dockerfile`**

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

**Step 4: Create `docker/nginx/api.conf`**

```nginx
server {
    listen 80;
    root /var/www/html/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

**Step 5: Verify containers start**

Run:
```bash
docker compose up -d
docker compose ps
```
Expected: All 4 services running.

**Step 6: Commit**

```bash
git add docker-compose.yml api/Dockerfile web/Dockerfile docker/
git commit -m "feat: add Docker Compose setup with all services"
```

---

### Task 4: Database Migrations

**Files:**
- Create: `api/database/migrations/xxxx_create_tenants_table.php`
- Create: `api/database/migrations/xxxx_add_tenant_to_users_table.php`
- Create: `api/database/migrations/xxxx_create_clients_table.php`
- Create: `api/database/migrations/xxxx_create_notes_table.php`
- Create: `api/database/migrations/xxxx_create_reminders_table.php`
- Create: `api/database/migrations/xxxx_create_templates_table.php`

**Step 1: Create tenants migration**

Run: `cd api && php artisan make:migration create_tenants_table`

```php
Schema::create('tenants', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->string('plan')->default('free');
    $table->timestamps();
});
```

**Step 2: Add tenant_id and role to users**

Run: `php artisan make:migration add_tenant_id_and_role_to_users_table`

```php
Schema::table('users', function (Blueprint $table) {
    $table->foreignId('tenant_id')->after('id')->constrained()->cascadeOnDelete();
    $table->enum('role', ['admin', 'user'])->default('user')->after('email');
});
```

**Step 3: Create clients migration**

Run: `php artisan make:migration create_clients_table`

```php
Schema::create('clients', function (Blueprint $table) {
    $table->id();
    $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->string('phone')->nullable();
    $table->string('email')->nullable();
    $table->enum('source', ['whatsapp', 'instagram', 'web', 'otro'])->default('otro');
    $table->enum('status', ['nuevo', 'contactado', 'presupuesto_enviado', 'seguimiento_pendiente', 'vendido', 'perdido'])->default('nuevo');
    $table->foreignId('assigned_to')->nullable()->constrained('users')->nullOnDelete();
    $table->timestamps();
    $table->softDeletes();
});
```

**Step 4: Create notes migration**

Run: `php artisan make:migration create_notes_table`

```php
Schema::create('notes', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->text('body');
    $table->timestamps();
});
```

**Step 5: Create reminders migration**

Run: `php artisan make:migration create_reminders_table`

```php
Schema::create('reminders', function (Blueprint $table) {
    $table->id();
    $table->foreignId('client_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->dateTime('due_at');
    $table->boolean('completed')->default(false);
    $table->timestamps();
});
```

**Step 6: Create templates migration**

Run: `php artisan make:migration create_templates_table`

```php
Schema::create('templates', function (Blueprint $table) {
    $table->id();
    $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->text('body');
    $table->timestamps();
});
```

**Step 7: Run migrations**

Run: `php artisan migrate`
Expected: All migrations run successfully.

**Step 8: Commit**

```bash
git add database/
git commit -m "feat: add all database migrations"
```

---

### Task 5: Models and Multi-Tenancy

**Files:**
- Create: `api/app/Models/Tenant.php`
- Modify: `api/app/Models/User.php`
- Create: `api/app/Models/Client.php`
- Create: `api/app/Models/Note.php`
- Create: `api/app/Models/Reminder.php`
- Create: `api/app/Models/Template.php`
- Create: `api/app/Traits/BelongsToTenant.php`
- Create: `api/app/Http/Middleware/EnsureTenant.php`

**Step 1: Create `BelongsToTenant` trait**

```php
// api/app/Traits/BelongsToTenant.php
namespace App\Traits;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant(): void
    {
        static::creating(function ($model) {
            if (auth()->check()) {
                $model->tenant_id = auth()->user()->tenant_id;
            }
        });

        static::addGlobalScope('tenant', function (Builder $builder) {
            if (auth()->check()) {
                $builder->where($builder->getModel()->getTable() . '.tenant_id', auth()->user()->tenant_id);
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(Tenant::class);
    }
}
```

**Step 2: Create `EnsureTenant` middleware**

```php
// api/app/Http/Middleware/EnsureTenant.php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureTenant
{
    public function handle(Request $request, Closure $next)
    {
        if (!auth()->check() || !auth()->user()->tenant_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}
```

**Step 3: Create Tenant model**

```php
// api/app/Models/Tenant.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tenant extends Model
{
    protected $fillable = ['name', 'slug', 'plan'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function clients()
    {
        return $this->hasMany(Client::class);
    }
}
```

**Step 4: Update User model**

Add to `api/app/Models/User.php`:
```php
protected $fillable = ['name', 'email', 'password', 'tenant_id', 'role'];

public function tenant()
{
    return $this->belongsTo(Tenant::class);
}
```

**Step 5: Create Client model**

```php
// api/app/Models/Client.php
namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use BelongsToTenant, SoftDeletes;

    protected $fillable = ['name', 'phone', 'email', 'source', 'status', 'assigned_to'];

    public function notes()
    {
        return $this->hasMany(Note::class);
    }

    public function reminders()
    {
        return $this->hasMany(Reminder::class);
    }

    public function assignedTo()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
```

**Step 6: Create Note model**

```php
// api/app/Models/Note.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    protected $fillable = ['client_id', 'user_id', 'body'];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

**Step 7: Create Reminder model**

```php
// api/app/Models/Reminder.php
namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Reminder extends Model
{
    use BelongsToTenant;

    protected $fillable = ['client_id', 'user_id', 'title', 'due_at', 'completed'];

    protected $casts = [
        'due_at' => 'datetime',
        'completed' => 'boolean',
    ];

    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
```

**Step 8: Create Template model**

```php
// api/app/Models/Template.php
namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Template extends Model
{
    use BelongsToTenant;

    protected $fillable = ['name', 'body'];
}
```

**Step 9: Register middleware in `api/bootstrap/app.php`**

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'tenant' => \App\Http\Middleware\EnsureTenant::class,
    ]);
    $middleware->statefulApi();
})
```

**Step 10: Commit**

```bash
git add app/
git commit -m "feat: add models, BelongsToTenant trait, and tenant middleware"
```

---

### Task 6: Auth — Registration and Login

**Files:**
- Create: `api/app/Http/Controllers/AuthController.php`
- Create: `api/app/Http/Requests/RegisterRequest.php`
- Create: `api/app/Http/Requests/LoginRequest.php`
- Modify: `api/routes/api.php`
- Create: `api/tests/Feature/AuthTest.php`

**Step 1: Write tests**

```php
// api/tests/Feature/AuthTest.php
namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_register_creates_tenant_and_user(): void
    {
        $response = $this->postJson('/api/register', [
            'business_name' => 'Mi Negocio',
            'name' => 'Juan',
            'email' => 'juan@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('tenants', ['name' => 'Mi Negocio']);
        $this->assertDatabaseHas('users', ['email' => 'juan@test.com', 'role' => 'admin']);
    }

    public function test_login_returns_user(): void
    {
        $this->postJson('/api/register', [
            'business_name' => 'Mi Negocio',
            'name' => 'Juan',
            'email' => 'juan@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'juan@test.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure(['user' => ['id', 'name', 'email']]);
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->postJson('/api/register', [
            'business_name' => 'Mi Negocio',
            'name' => 'Juan',
            'email' => 'juan@test.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'juan@test.com',
            'password' => 'wrong',
        ]);

        $response->assertStatus(422);
    }
}
```

**Step 2: Run tests to verify they fail**

Run: `cd api && php artisan test --filter=AuthTest`
Expected: FAIL

**Step 3: Create RegisterRequest**

```php
// api/app/Http/Requests/RegisterRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'business_name' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ];
    }
}
```

**Step 4: Create LoginRequest**

```php
// api/app/Http/Requests/LoginRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'password' => 'required|string',
        ];
    }
}
```

**Step 5: Create AuthController**

```php
// api/app/Http/Controllers/AuthController.php
namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(RegisterRequest $request)
    {
        $data = DB::transaction(function () use ($request) {
            $tenant = Tenant::create([
                'name' => $request->business_name,
                'slug' => Str::slug($request->business_name) . '-' . Str::random(4),
            ]);

            $user = User::create([
                'tenant_id' => $tenant->id,
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'admin',
            ]);

            return compact('tenant', 'user');
        });

        auth()->login($data['user']);

        return response()->json(['user' => $data['user']], 201);
    }

    public function login(LoginRequest $request)
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales son incorrectas.'],
            ]);
        }

        auth()->login($user);

        return response()->json(['user' => $user]);
    }

    public function logout()
    {
        auth()->logout();
        return response()->json(['message' => 'Sesion cerrada']);
    }

    public function me()
    {
        return response()->json(['user' => auth()->user()->load('tenant')]);
    }
}
```

**Step 6: Add routes in `api/routes/api.php`**

```php
use App\Http\Controllers\AuthController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'tenant'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
});
```

**Step 7: Run tests**

Run: `php artisan test --filter=AuthTest`
Expected: All PASS

**Step 8: Commit**

```bash
git add app/ routes/ tests/
git commit -m "feat: add auth (register, login, logout) with tenant creation"
```

---

### Task 7: Clients CRUD

**Files:**
- Create: `api/app/Http/Controllers/ClientController.php`
- Create: `api/app/Http/Requests/StoreClientRequest.php`
- Create: `api/app/Http/Requests/UpdateClientRequest.php`
- Modify: `api/routes/api.php`
- Create: `api/tests/Feature/ClientTest.php`

**Step 1: Write tests**

```php
// api/tests/Feature/ClientTest.php
namespace Tests\Feature;

use App\Models\Client;
use App\Models\Tenant;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ClientTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = Tenant::create(['name' => 'Test', 'slug' => 'test']);
        $this->user = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Test',
            'email' => 'test@test.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
        ]);
    }

    public function test_list_clients(): void
    {
        Client::create(['tenant_id' => $this->user->tenant_id, 'name' => 'Cliente 1']);
        $response = $this->actingAs($this->user)->getJson('/api/clients');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }

    public function test_create_client(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/clients', [
            'name' => 'Nuevo Cliente',
            'phone' => '+5491155556666',
            'source' => 'whatsapp',
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('clients', ['name' => 'Nuevo Cliente']);
    }

    public function test_update_client_status(): void
    {
        $client = Client::create(['tenant_id' => $this->user->tenant_id, 'name' => 'Cliente']);
        $response = $this->actingAs($this->user)->patchJson("/api/clients/{$client->id}/status", [
            'status' => 'contactado',
        ]);
        $response->assertStatus(200);
        $this->assertEquals('contactado', $client->fresh()->status);
    }

    public function test_cannot_see_other_tenant_clients(): void
    {
        $otherTenant = Tenant::create(['name' => 'Other', 'slug' => 'other']);
        Client::create(['tenant_id' => $otherTenant->id, 'name' => 'Hidden']);

        $response = $this->actingAs($this->user)->getJson('/api/clients');
        $response->assertJsonCount(0, 'data');
    }
}
```

**Step 2: Run tests to verify they fail**

Run: `php artisan test --filter=ClientTest`
Expected: FAIL

**Step 3: Create StoreClientRequest**

```php
// api/app/Http/Requests/StoreClientRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreClientRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'source' => 'nullable|in:whatsapp,instagram,web,otro',
            'status' => 'nullable|in:nuevo,contactado,presupuesto_enviado,seguimiento_pendiente,vendido,perdido',
            'assigned_to' => 'nullable|exists:users,id',
        ];
    }
}
```

**Step 4: Create UpdateClientRequest**

```php
// api/app/Http/Requests/UpdateClientRequest.php
namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateClientRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'source' => 'nullable|in:whatsapp,instagram,web,otro',
            'assigned_to' => 'nullable|exists:users,id',
        ];
    }
}
```

**Step 5: Create ClientController**

```php
// api/app/Http/Controllers/ClientController.php
namespace App\Http\Controllers;

use App\Http\Requests\StoreClientRequest;
use App\Http\Requests\UpdateClientRequest;
use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query();

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        return response()->json(['data' => $query->latest()->paginate(20)]);
    }

    public function store(StoreClientRequest $request)
    {
        $client = Client::create($request->validated());
        return response()->json(['data' => $client], 201);
    }

    public function show(Client $client)
    {
        return response()->json(['data' => $client->load(['notes.user', 'reminders'])]);
    }

    public function update(UpdateClientRequest $request, Client $client)
    {
        $client->update($request->validated());
        return response()->json(['data' => $client]);
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return response()->json(['message' => 'Cliente eliminado']);
    }

    public function updateStatus(Request $request, Client $client)
    {
        $request->validate([
            'status' => 'required|in:nuevo,contactado,presupuesto_enviado,seguimiento_pendiente,vendido,perdido',
        ]);

        $client->update(['status' => $request->status]);
        return response()->json(['data' => $client]);
    }
}
```

**Step 6: Add routes**

Add inside the `auth:sanctum + tenant` group in `api/routes/api.php`:
```php
use App\Http\Controllers\ClientController;

Route::apiResource('clients', ClientController::class);
Route::patch('clients/{client}/status', [ClientController::class, 'updateStatus']);
```

**Step 7: Run tests**

Run: `php artisan test --filter=ClientTest`
Expected: All PASS

**Step 8: Commit**

```bash
git add app/ routes/ tests/
git commit -m "feat: add clients CRUD with tenant isolation and status management"
```

---

### Task 8: Notes CRUD

**Files:**
- Create: `api/app/Http/Controllers/NoteController.php`
- Modify: `api/routes/api.php`
- Create: `api/tests/Feature/NoteTest.php`

**Step 1: Write tests**

```php
// api/tests/Feature/NoteTest.php
namespace Tests\Feature;

use App\Models\Client;
use App\Models\Tenant;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NoteTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Client $client;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = Tenant::create(['name' => 'Test', 'slug' => 'test']);
        $this->user = User::create([
            'tenant_id' => $tenant->id, 'name' => 'Test',
            'email' => 'test@test.com', 'password' => bcrypt('pw'), 'role' => 'admin',
        ]);
        $this->client = Client::create(['tenant_id' => $tenant->id, 'name' => 'Cliente']);
    }

    public function test_add_note_to_client(): void
    {
        $response = $this->actingAs($this->user)->postJson("/api/clients/{$this->client->id}/notes", [
            'body' => 'Llamar manana',
        ]);
        $response->assertStatus(201);
        $this->assertDatabaseHas('notes', ['body' => 'Llamar manana']);
    }

    public function test_delete_note(): void
    {
        $note = $this->client->notes()->create(['user_id' => $this->user->id, 'body' => 'Test']);
        $response = $this->actingAs($this->user)->deleteJson("/api/notes/{$note->id}");
        $response->assertStatus(200);
    }
}
```

**Step 2: Run tests — expect FAIL**

**Step 3: Create NoteController**

```php
// api/app/Http/Controllers/NoteController.php
namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Note;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    public function store(Request $request, Client $client)
    {
        $request->validate(['body' => 'required|string']);

        $note = $client->notes()->create([
            'user_id' => auth()->id(),
            'body' => $request->body,
        ]);

        return response()->json(['data' => $note->load('user')], 201);
    }

    public function destroy(Note $note)
    {
        $note->delete();
        return response()->json(['message' => 'Nota eliminada']);
    }
}
```

**Step 4: Add routes**

```php
use App\Http\Controllers\NoteController;

Route::post('clients/{client}/notes', [NoteController::class, 'store']);
Route::delete('notes/{note}', [NoteController::class, 'destroy']);
```

**Step 5: Run tests — expect PASS**

**Step 6: Commit**

```bash
git add app/ routes/ tests/
git commit -m "feat: add notes for clients"
```

---

### Task 9: Reminders CRUD

**Files:**
- Create: `api/app/Http/Controllers/ReminderController.php`
- Modify: `api/routes/api.php`
- Create: `api/tests/Feature/ReminderTest.php`

**Step 1: Write tests**

```php
// api/tests/Feature/ReminderTest.php
namespace Tests\Feature;

use App\Models\Client;
use App\Models\Reminder;
use App\Models\Tenant;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ReminderTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Client $client;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = Tenant::create(['name' => 'Test', 'slug' => 'test']);
        $this->user = User::create([
            'tenant_id' => $tenant->id, 'name' => 'Test',
            'email' => 'test@test.com', 'password' => bcrypt('pw'), 'role' => 'admin',
        ]);
        $this->client = Client::create(['tenant_id' => $tenant->id, 'name' => 'Cliente']);
    }

    public function test_create_reminder(): void
    {
        $response = $this->actingAs($this->user)->postJson("/api/clients/{$this->client->id}/reminders", [
            'title' => 'Llamar para seguimiento',
            'due_at' => '2026-05-20 10:00:00',
        ]);
        $response->assertStatus(201);
    }

    public function test_list_pending_reminders(): void
    {
        Reminder::create([
            'client_id' => $this->client->id,
            'user_id' => $this->user->id,
            'tenant_id' => $this->user->tenant_id,
            'title' => 'Pendiente',
            'due_at' => now()->subDay(),
            'completed' => false,
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/reminders');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }

    public function test_mark_reminder_completed(): void
    {
        $reminder = Reminder::create([
            'client_id' => $this->client->id,
            'user_id' => $this->user->id,
            'tenant_id' => $this->user->tenant_id,
            'title' => 'Test',
            'due_at' => now(),
            'completed' => false,
        ]);

        $response = $this->actingAs($this->user)->patchJson("/api/reminders/{$reminder->id}", [
            'completed' => true,
        ]);
        $response->assertStatus(200);
        $this->assertTrue($reminder->fresh()->completed);
    }
}
```

**Step 2: Run tests — expect FAIL**

**Step 3: Create ReminderController**

```php
// api/app/Http/Controllers/ReminderController.php
namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Reminder;
use Illuminate\Http\Request;

class ReminderController extends Controller
{
    public function index()
    {
        $reminders = Reminder::where('user_id', auth()->id())
            ->where('completed', false)
            ->with('client:id,name')
            ->orderBy('due_at')
            ->get();

        return response()->json(['data' => $reminders]);
    }

    public function store(Request $request, Client $client)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'due_at' => 'required|date',
        ]);

        $reminder = Reminder::create([
            'client_id' => $client->id,
            'user_id' => auth()->id(),
            'tenant_id' => auth()->user()->tenant_id,
            'title' => $request->title,
            'due_at' => $request->due_at,
        ]);

        return response()->json(['data' => $reminder], 201);
    }

    public function update(Request $request, Reminder $reminder)
    {
        $request->validate(['completed' => 'required|boolean']);
        $reminder->update(['completed' => $request->completed]);
        return response()->json(['data' => $reminder]);
    }

    public function destroy(Reminder $reminder)
    {
        $reminder->delete();
        return response()->json(['message' => 'Recordatorio eliminado']);
    }
}
```

**Step 4: Add routes**

```php
use App\Http\Controllers\ReminderController;

Route::get('reminders', [ReminderController::class, 'index']);
Route::post('clients/{client}/reminders', [ReminderController::class, 'store']);
Route::patch('reminders/{reminder}', [ReminderController::class, 'update']);
Route::delete('reminders/{reminder}', [ReminderController::class, 'destroy']);
```

**Step 5: Run tests — expect PASS**

**Step 6: Commit**

```bash
git add app/ routes/ tests/
git commit -m "feat: add reminders CRUD"
```

---

### Task 10: Templates CRUD

**Files:**
- Create: `api/app/Http/Controllers/TemplateController.php`
- Modify: `api/routes/api.php`
- Create: `api/tests/Feature/TemplateTest.php`

**Step 1: Write tests**

```php
// api/tests/Feature/TemplateTest.php
namespace Tests\Feature;

use App\Models\Tenant;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TemplateTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = Tenant::create(['name' => 'Test', 'slug' => 'test']);
        $this->user = User::create([
            'tenant_id' => $tenant->id, 'name' => 'Test',
            'email' => 'test@test.com', 'password' => bcrypt('pw'), 'role' => 'admin',
        ]);
    }

    public function test_create_template(): void
    {
        $response = $this->actingAs($this->user)->postJson('/api/templates', [
            'name' => 'Seguimiento',
            'body' => 'Hola {nombre}, te escribo desde {negocio} para darte seguimiento.',
        ]);
        $response->assertStatus(201);
    }

    public function test_list_templates(): void
    {
        $this->actingAs($this->user)->postJson('/api/templates', [
            'name' => 'Test', 'body' => 'Hola {nombre}',
        ]);

        $response = $this->actingAs($this->user)->getJson('/api/templates');
        $response->assertStatus(200);
        $response->assertJsonCount(1, 'data');
    }
}
```

**Step 2: Run tests — expect FAIL**

**Step 3: Create TemplateController**

```php
// api/app/Http/Controllers/TemplateController.php
namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;

class TemplateController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Template::all()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'body' => 'required|string',
        ]);

        $template = Template::create($request->only('name', 'body'));
        return response()->json(['data' => $template], 201);
    }

    public function update(Request $request, Template $template)
    {
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'body' => 'sometimes|string',
        ]);

        $template->update($request->only('name', 'body'));
        return response()->json(['data' => $template]);
    }

    public function destroy(Template $template)
    {
        $template->delete();
        return response()->json(['message' => 'Plantilla eliminada']);
    }
}
```

**Step 4: Add routes**

```php
use App\Http\Controllers\TemplateController;

Route::apiResource('templates', TemplateController::class);
```

**Step 5: Run tests — expect PASS**

**Step 6: Commit**

```bash
git add app/ routes/ tests/
git commit -m "feat: add message templates CRUD"
```

---

### Task 11: Dashboard and WhatsApp Link

**Files:**
- Create: `api/app/Http/Controllers/DashboardController.php`
- Create: `api/app/Http/Controllers/WhatsappController.php`
- Modify: `api/routes/api.php`
- Create: `api/tests/Feature/DashboardTest.php`

**Step 1: Write tests**

```php
// api/tests/Feature/DashboardTest.php
namespace Tests\Feature;

use App\Models\Client;
use App\Models\Tenant;
use App\Models\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $tenant = Tenant::create(['name' => 'Test', 'slug' => 'test']);
        $this->user = User::create([
            'tenant_id' => $tenant->id, 'name' => 'Test',
            'email' => 'test@test.com', 'password' => bcrypt('pw'), 'role' => 'admin',
        ]);
    }

    public function test_dashboard_returns_counters(): void
    {
        Client::create(['tenant_id' => $this->user->tenant_id, 'name' => 'A', 'status' => 'nuevo']);
        Client::create(['tenant_id' => $this->user->tenant_id, 'name' => 'B', 'status' => 'vendido']);
        Client::create(['tenant_id' => $this->user->tenant_id, 'name' => 'C', 'status' => 'perdido']);

        $response = $this->actingAs($this->user)->getJson('/api/dashboard');
        $response->assertStatus(200);
        $response->assertJson([
            'nuevo' => 1,
            'vendido' => 1,
            'perdido' => 1,
        ]);
    }
}
```

**Step 2: Run tests — expect FAIL**

**Step 3: Create DashboardController**

```php
// api/app/Http/Controllers/DashboardController.php
namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Reminder;

class DashboardController extends Controller
{
    public function __invoke()
    {
        $statuses = ['nuevo', 'contactado', 'presupuesto_enviado', 'seguimiento_pendiente', 'vendido', 'perdido'];
        $counts = [];

        foreach ($statuses as $status) {
            $counts[$status] = Client::where('status', $status)->count();
        }

        $counts['reminders_pending'] = Reminder::where('user_id', auth()->id())
            ->where('completed', false)
            ->where('due_at', '<=', now())
            ->count();

        return response()->json($counts);
    }
}
```

**Step 4: Create WhatsappController**

```php
// api/app/Http/Controllers/WhatsappController.php
namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Template;
use Illuminate\Http\Request;

class WhatsappController extends Controller
{
    public function link(Request $request, Client $client)
    {
        $message = '';

        if ($request->has('template_id')) {
            $template = Template::findOrFail($request->template_id);
            $message = str_replace(
                ['{nombre}', '{negocio}'],
                [$client->name, auth()->user()->tenant->name],
                $template->body
            );
        }

        $phone = preg_replace('/[^0-9]/', '', $client->phone ?? '');
        $url = "https://wa.me/{$phone}?text=" . urlencode($message);

        return response()->json(['url' => $url]);
    }
}
```

**Step 5: Add routes**

```php
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\WhatsappController;

Route::get('dashboard', DashboardController::class);
Route::get('whatsapp-link/{client}', [WhatsappController::class, 'link']);
```

**Step 6: Run tests — expect PASS**

**Step 7: Commit**

```bash
git add app/ routes/ tests/
git commit -m "feat: add dashboard counters and WhatsApp link generator"
```

---

### Task 12: Users Management

**Files:**
- Create: `api/app/Http/Controllers/UserController.php`
- Modify: `api/routes/api.php`

**Step 1: Create UserController**

```php
// api/app/Http/Controllers/UserController.php
namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::where('tenant_id', auth()->user()->tenant_id)->get();
        return response()->json(['data' => $users]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'nullable|in:admin,user',
        ]);

        $user = User::create([
            'tenant_id' => auth()->user()->tenant_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'user',
        ]);

        return response()->json(['data' => $user], 201);
    }

    public function destroy(User $user)
    {
        if ($user->tenant_id !== auth()->user()->tenant_id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'No podes eliminarte a vos mismo'], 422);
        }

        $user->delete();
        return response()->json(['message' => 'Usuario eliminado']);
    }
}
```

**Step 2: Add routes**

```php
use App\Http\Controllers\UserController;

Route::get('users', [UserController::class, 'index']);
Route::post('users', [UserController::class, 'store']);
Route::delete('users/{user}', [UserController::class, 'destroy']);
```

**Step 3: Commit**

```bash
git add app/ routes/
git commit -m "feat: add users management for tenant admins"
```

---

### Task 13: Frontend — Auth Pages

**Files:**
- Create: `web/src/lib/api.ts`
- Create: `web/src/hooks/useAuth.ts`
- Create: `web/src/pages/Login.tsx`
- Create: `web/src/pages/Register.tsx`
- Create: `web/src/components/Layout.tsx`
- Modify: `web/src/App.tsx`

**Step 1: Create API client**

```typescript
// web/src/lib/api.ts
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
})

export default api
```

**Step 2: Create auth hook**

```typescript
// web/src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { useNavigate } from 'react-router-dom'

export function useAuth() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get('/me').then(r => r.data.user),
    retry: false,
  })

  const login = useMutation({
    mutationFn: (data: { email: string; password: string }) => api.post('/login', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/dashboard')
    },
  })

  const register = useMutation({
    mutationFn: (data: { business_name: string; name: string; email: string; password: string; password_confirmation: string }) =>
      api.post('/register', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      navigate('/dashboard')
    },
  })

  const logout = useMutation({
    mutationFn: () => api.post('/logout'),
    onSuccess: () => {
      queryClient.clear()
      navigate('/login')
    },
  })

  return { user, isLoading, login, register, logout }
}
```

**Step 3: Create Login page**

```tsx
// web/src/pages/Login.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate(form)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Seguidor</h1>
        <input
          type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        <input
          type="password" placeholder="Contraseña" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded px-3 py-2"
        />
        {login.isError && <p className="text-red-500 text-sm">Credenciales incorrectas</p>}
        <button type="submit" disabled={login.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Iniciar sesion
        </button>
        <p className="text-center text-sm text-gray-500">
          No tenes cuenta? <Link to="/register" className="text-blue-600">Registrate</Link>
        </p>
      </form>
    </div>
  )
}
```

**Step 4: Create Register page**

```tsx
// web/src/pages/Register.tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    business_name: '', name: '', email: '', password: '', password_confirmation: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    register.mutate(form)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Crear cuenta</h1>
        <input placeholder="Nombre del negocio" value={form.business_name}
          onChange={e => setForm({ ...form, business_name: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <input placeholder="Tu nombre" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <input type="password" placeholder="Contraseña" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <input type="password" placeholder="Confirmar contraseña" value={form.password_confirmation}
          onChange={e => setForm({ ...form, password_confirmation: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        {register.isError && <p className="text-red-500 text-sm">Error al registrar</p>}
        <button type="submit" disabled={register.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Registrarme
        </button>
        <p className="text-center text-sm text-gray-500">
          Ya tenes cuenta? <Link to="/login" className="text-blue-600">Inicia sesion</Link>
        </p>
      </form>
    </div>
  )
}
```

**Step 5: Create Layout component**

```tsx
// web/src/components/Layout.tsx
import { Link, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-900 text-white p-4 space-y-2">
        <h1 className="text-xl font-bold mb-6">Seguidor</h1>
        <Link to="/dashboard" className="block px-3 py-2 rounded hover:bg-gray-700">Dashboard</Link>
        <Link to="/clients" className="block px-3 py-2 rounded hover:bg-gray-700">Clientes</Link>
        <Link to="/reminders" className="block px-3 py-2 rounded hover:bg-gray-700">Seguimientos</Link>
        <Link to="/templates" className="block px-3 py-2 rounded hover:bg-gray-700">Plantillas</Link>
        <Link to="/settings" className="block px-3 py-2 rounded hover:bg-gray-700">Configuracion</Link>
        <div className="mt-auto pt-8">
          <p className="text-sm text-gray-400">{user?.name}</p>
          <button onClick={() => logout.mutate()} className="text-sm text-red-400 hover:text-red-300">
            Cerrar sesion
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <Outlet />
      </main>
    </div>
  )
}
```

**Step 6: Update App.tsx with routes**

```tsx
// web/src/App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Layout from './components/Layout'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" />} />
            <Route path="dashboard" element={<div>Dashboard</div>} />
            <Route path="clients" element={<div>Clientes</div>} />
            <Route path="clients/:id" element={<div>Cliente</div>} />
            <Route path="reminders" element={<div>Seguimientos</div>} />
            <Route path="templates" element={<div>Plantillas</div>} />
            <Route path="settings" element={<div>Settings</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
```

**Step 7: Commit**

```bash
git add web/src/
git commit -m "feat: add auth pages, layout, routing, and API client"
```

---

### Task 14: Frontend — Dashboard Page

**Files:**
- Create: `web/src/pages/Dashboard.tsx`
- Modify: `web/src/App.tsx`

**Step 1: Create Dashboard**

```tsx
// web/src/pages/Dashboard.tsx
import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'

const STATUS_LABELS: Record<string, string> = {
  nuevo: 'Nuevos',
  contactado: 'Contactados',
  presupuesto_enviado: 'Presupuestos enviados',
  seguimiento_pendiente: 'Seguimiento pendiente',
  vendido: 'Vendidos',
  perdido: 'Perdidos',
  reminders_pending: 'Seguimientos atrasados',
}

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/dashboard').then(r => r.data),
  })

  if (isLoading) return <div>Cargando...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(data || {}).map(([key, value]) => (
          <div key={key} className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">{STATUS_LABELS[key] || key}</p>
            <p className="text-3xl font-bold">{value as number}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**Step 2: Update App.tsx route**

Replace `<div>Dashboard</div>` with `<Dashboard />` and add import.

**Step 3: Commit**

```bash
git add web/src/
git commit -m "feat: add dashboard page with counters"
```

---

### Task 15: Frontend — Clients List Page

**Files:**
- Create: `web/src/pages/Clients.tsx`
- Modify: `web/src/App.tsx`

**Step 1: Create Clients page**

```tsx
// web/src/pages/Clients.tsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'

const STATUSES = ['todos', 'nuevo', 'contactado', 'presupuesto_enviado', 'seguimiento_pendiente', 'vendido', 'perdido']

export default function Clients() {
  const [status, setStatus] = useState('todos')
  const [search, setSearch] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['clients', status, search],
    queryFn: () => {
      const params: Record<string, string> = {}
      if (status !== 'todos') params.status = status
      if (search) params.search = search
      return api.get('/clients', { params }).then(r => r.data.data)
    },
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <Link to="/clients/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Nuevo cliente
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <input placeholder="Buscar..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-1" />
        <select value={status} onChange={e => setStatus(e.target.value)}
          className="border rounded px-3 py-2">
          {STATUSES.map(s => <option key={s} value={s}>{s === 'todos' ? 'Todos' : s.replace('_', ' ')}</option>)}
        </select>
      </div>

      {isLoading ? <p>Cargando...</p> : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Nombre</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Telefono</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Origen</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(data?.data || []).map((client: any) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link to={`/clients/${client.id}`} className="text-blue-600 hover:underline">{client.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-sm">{client.phone || '-'}</td>
                  <td className="px-4 py-3 text-sm">{client.source}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">{client.status.replace('_', ' ')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
```

**Step 2: Update App.tsx route — import Clients, replace placeholder**

**Step 3: Commit**

```bash
git add web/src/
git commit -m "feat: add clients list page with search and status filter"
```

---

### Task 16: Frontend — Client Detail Page

**Files:**
- Create: `web/src/pages/ClientDetail.tsx`
- Modify: `web/src/App.tsx`

**Step 1: Create ClientDetail page**

```tsx
// web/src/pages/ClientDetail.tsx
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export default function ClientDetail() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [note, setNote] = useState('')

  const { data: client, isLoading } = useQuery({
    queryKey: ['client', id],
    queryFn: () => api.get(`/clients/${id}`).then(r => r.data.data),
  })

  const { data: templates } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get('/templates').then(r => r.data.data),
  })

  const addNote = useMutation({
    mutationFn: (body: string) => api.post(`/clients/${id}/notes`, { body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client', id] })
      setNote('')
    },
  })

  const updateStatus = useMutation({
    mutationFn: (status: string) => api.patch(`/clients/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['client', id] }),
  })

  const openWhatsapp = async (templateId?: number) => {
    const params = templateId ? `?template_id=${templateId}` : ''
    const { data } = await api.get(`/whatsapp-link/${id}${params}`)
    window.open(data.url, '_blank')
  }

  if (isLoading) return <div>Cargando...</div>

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-2xl font-bold">{client.name}</h2>
        <p className="text-gray-500">{client.phone} | {client.email || 'Sin email'}</p>
        <p className="text-sm mt-1">Origen: {client.source} | Estado: {client.status.replace('_', ' ')}</p>

        <div className="flex gap-2 mt-4">
          <select onChange={e => updateStatus.mutate(e.target.value)} value={client.status}
            className="border rounded px-3 py-1 text-sm">
            {['nuevo','contactado','presupuesto_enviado','seguimiento_pendiente','vendido','perdido'].map(s =>
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            )}
          </select>

          <button onClick={() => openWhatsapp()} className="bg-green-500 text-white px-3 py-1 rounded text-sm">
            WhatsApp
          </button>
          {(templates || []).map((t: any) => (
            <button key={t.id} onClick={() => openWhatsapp(t.id)}
              className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm">
              WA: {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="font-bold mb-4">Notas</h3>
        <form onSubmit={e => { e.preventDefault(); addNote.mutate(note) }} className="flex gap-2 mb-4">
          <input value={note} onChange={e => setNote(e.target.value)}
            placeholder="Agregar nota..." className="flex-1 border rounded px-3 py-2" />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Agregar</button>
        </form>
        <div className="space-y-3">
          {(client.notes || []).map((n: any) => (
            <div key={n.id} className="border-l-2 border-gray-200 pl-3">
              <p>{n.body}</p>
              <p className="text-xs text-gray-400">{n.user?.name} - {new Date(n.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Update App.tsx route**

**Step 3: Commit**

```bash
git add web/src/
git commit -m "feat: add client detail page with notes, status change, and WhatsApp"
```

---

### Task 17: Frontend — Reminders Page

**Files:**
- Create: `web/src/pages/Reminders.tsx`
- Modify: `web/src/App.tsx`

**Step 1: Create Reminders page**

```tsx
// web/src/pages/Reminders.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../lib/api'

export default function Reminders() {
  const queryClient = useQueryClient()

  const { data: reminders, isLoading } = useQuery({
    queryKey: ['reminders'],
    queryFn: () => api.get('/reminders').then(r => r.data.data),
  })

  const complete = useMutation({
    mutationFn: (id: number) => api.patch(`/reminders/${id}`, { completed: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reminders'] }),
  })

  if (isLoading) return <div>Cargando...</div>

  const overdue = (reminders || []).filter((r: any) => new Date(r.due_at) < new Date())
  const upcoming = (reminders || []).filter((r: any) => new Date(r.due_at) >= new Date())

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Seguimientos pendientes</h2>

      {overdue.length > 0 && (
        <div className="mb-6">
          <h3 className="text-red-600 font-semibold mb-2">Atrasados ({overdue.length})</h3>
          <div className="space-y-2">
            {overdue.map((r: any) => (
              <div key={r.id} className="bg-red-50 border border-red-200 rounded p-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">{r.title}</p>
                  <Link to={`/clients/${r.client_id}`} className="text-sm text-blue-600">{r.client?.name}</Link>
                  <p className="text-xs text-gray-500">{new Date(r.due_at).toLocaleString()}</p>
                </div>
                <button onClick={() => complete.mutate(r.id)} className="text-sm bg-white border px-3 py-1 rounded">
                  Completar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-2">Proximos ({upcoming.length})</h3>
        <div className="space-y-2">
          {upcoming.map((r: any) => (
            <div key={r.id} className="bg-white border rounded p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{r.title}</p>
                <Link to={`/clients/${r.client_id}`} className="text-sm text-blue-600">{r.client?.name}</Link>
                <p className="text-xs text-gray-500">{new Date(r.due_at).toLocaleString()}</p>
              </div>
              <button onClick={() => complete.mutate(r.id)} className="text-sm bg-white border px-3 py-1 rounded">
                Completar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: Update App.tsx route**

**Step 3: Commit**

```bash
git add web/src/
git commit -m "feat: add reminders page with overdue/upcoming sections"
```

---

### Task 18: Frontend — Templates Page

**Files:**
- Create: `web/src/pages/Templates.tsx`
- Modify: `web/src/App.tsx`

**Step 1: Create Templates page**

```tsx
// web/src/pages/Templates.tsx
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'

export default function Templates() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState({ name: '', body: '' })
  const [editing, setEditing] = useState<number | null>(null)

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => api.get('/templates').then(r => r.data.data),
  })

  const save = useMutation({
    mutationFn: (data: { name: string; body: string }) =>
      editing ? api.put(`/templates/${editing}`, data) : api.post('/templates', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] })
      setForm({ name: '', body: '' })
      setEditing(null)
    },
  })

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/templates/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['templates'] }),
  })

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Plantillas de mensajes</h2>

      <form onSubmit={e => { e.preventDefault(); save.mutate(form) }} className="bg-white rounded-lg shadow p-4 mb-6 space-y-3">
        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
          placeholder="Nombre de la plantilla" className="w-full border rounded px-3 py-2" />
        <textarea value={form.body} onChange={e => setForm({ ...form, body: e.target.value })}
          placeholder="Mensaje. Variables: {nombre}, {negocio}" rows={3} className="w-full border rounded px-3 py-2" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editing ? 'Guardar cambios' : 'Crear plantilla'}
        </button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ name: '', body: '' }) }}
          className="ml-2 text-gray-500">Cancelar</button>}
      </form>

      {isLoading ? <p>Cargando...</p> : (
        <div className="space-y-3">
          {(templates || []).map((t: any) => (
            <div key={t.id} className="bg-white rounded-lg shadow p-4 flex justify-between">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="text-sm text-gray-500">{t.body}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(t.id); setForm({ name: t.name, body: t.body }) }}
                  className="text-sm text-blue-600">Editar</button>
                <button onClick={() => remove.mutate(t.id)} className="text-sm text-red-600">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 2: Update App.tsx route**

**Step 3: Commit**

```bash
git add web/src/
git commit -m "feat: add templates CRUD page"
```

---

### Task 19: Frontend — New Client Form

**Files:**
- Create: `web/src/pages/ClientNew.tsx`
- Modify: `web/src/App.tsx`

**Step 1: Create ClientNew page**

```tsx
// web/src/pages/ClientNew.tsx
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../lib/api'

export default function ClientNew() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', phone: '', email: '', source: 'otro' })

  const create = useMutation({
    mutationFn: (data: typeof form) => api.post('/clients', data),
    onSuccess: (res) => navigate(`/clients/${res.data.data.id}`),
  })

  return (
    <div className="max-w-lg">
      <h2 className="text-2xl font-bold mb-6">Nuevo cliente</h2>
      <form onSubmit={e => { e.preventDefault(); create.mutate(form) }} className="bg-white rounded-lg shadow p-6 space-y-4">
        <input placeholder="Nombre *" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="w-full border rounded px-3 py-2" required />
        <input placeholder="Telefono" value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <input type="email" placeholder="Email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })}
          className="w-full border rounded px-3 py-2" />
        <select value={form.source} onChange={e => setForm({ ...form, source: e.target.value })}
          className="w-full border rounded px-3 py-2">
          <option value="whatsapp">WhatsApp</option>
          <option value="instagram">Instagram</option>
          <option value="web">Web</option>
          <option value="otro">Otro</option>
        </select>
        <button type="submit" disabled={create.isPending}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Crear cliente
        </button>
      </form>
    </div>
  )
}
```

**Step 2: Add route `/clients/new` in App.tsx (before `/clients/:id`)**

**Step 3: Commit**

```bash
git add web/src/
git commit -m "feat: add new client form page"
```

---

### Task 20: Protected Routes and Final Wiring

**Files:**
- Create: `web/src/components/ProtectedRoute.tsx`
- Modify: `web/src/App.tsx`

**Step 1: Create ProtectedRoute**

```tsx
// web/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
  if (!user) return <Navigate to="/login" />

  return <>{children}</>
}
```

**Step 2: Wrap Layout route with ProtectedRoute in App.tsx**

```tsx
<Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
```

**Step 3: Add Sanctum CSRF cookie call in api.ts**

Add interceptor:
```typescript
// Add before export in api.ts
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 419) {
      await axios.get(
        (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/sanctum/csrf-cookie',
        { withCredentials: true }
      )
      return api.request(error.config)
    }
    return Promise.reject(error)
  }
)
```

**Step 4: Commit**

```bash
git add web/src/
git commit -m "feat: add protected routes and CSRF handling"
```

---

### Task 21: Rate Limiting and Security Hardening

**Files:**
- Modify: `api/bootstrap/app.php`
- Modify: `api/app/Providers/AppServiceProvider.php`

**Step 1: Add rate limiting in AppServiceProvider**

```php
// In boot() method of AppServiceProvider
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

RateLimiter::for('auth', function ($request) {
    return Limit::perMinute(5)->by($request->ip());
});
```

**Step 2: Apply rate limiter to auth routes**

```php
Route::middleware('throttle:auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});
```

**Step 3: Commit**

```bash
git add api/
git commit -m "feat: add rate limiting on auth endpoints"
```

---

### Task 22: Notification System for Reminders

**Files:**
- Create: `api/database/migrations/xxxx_create_notifications_table.php`
- Create: `api/app/Models/Notification.php`
- Create: `api/app/Console/Commands/CheckReminders.php`
- Create: `api/app/Http/Controllers/NotificationController.php`
- Modify: `api/routes/api.php`
- Modify: `api/routes/console.php`

**Step 1: Create notifications migration**

```php
Schema::create('notifications', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->string('link')->nullable();
    $table->boolean('read')->default(false);
    $table->timestamps();
});
```

**Step 2: Create Notification model**

```php
// api/app/Models/Notification.php
namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use BelongsToTenant;

    protected $fillable = ['user_id', 'tenant_id', 'title', 'link', 'read'];
    protected $casts = ['read' => 'boolean'];
}
```

**Step 3: Create CheckReminders command**

```php
// api/app/Console/Commands/CheckReminders.php
namespace App\Console\Commands;

use App\Models\Notification;
use App\Models\Reminder;
use Illuminate\Console\Command;

class CheckReminders extends Command
{
    protected $signature = 'reminders:check';
    protected $description = 'Create notifications for due reminders';

    public function handle(): void
    {
        $due = Reminder::where('completed', false)
            ->where('due_at', '<=', now())
            ->whereDoesntHave('notification')
            ->get();

        foreach ($due as $reminder) {
            Notification::create([
                'user_id' => $reminder->user_id,
                'tenant_id' => $reminder->tenant_id,
                'title' => "Recordatorio: {$reminder->title}",
                'link' => "/clients/{$reminder->client_id}",
            ]);
        }

        $this->info("Created {$due->count()} notifications.");
    }
}
```

**Step 4: Schedule in `api/routes/console.php`**

```php
use Illuminate\Support\Facades\Schedule;

Schedule::command('reminders:check')->everyMinute();
```

**Step 5: Create NotificationController**

```php
// api/app/Http/Controllers/NotificationController.php
namespace App\Http\Controllers;

use App\Models\Notification;

class NotificationController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => Notification::where('user_id', auth()->id())
                ->where('read', false)
                ->latest()
                ->limit(20)
                ->get()
        ]);
    }

    public function markRead()
    {
        Notification::where('user_id', auth()->id())->update(['read' => true]);
        return response()->json(['message' => 'ok']);
    }
}
```

**Step 6: Add routes**

```php
use App\Http\Controllers\NotificationController;

Route::get('notifications', [NotificationController::class, 'index']);
Route::post('notifications/read', [NotificationController::class, 'markRead']);
```

**Step 7: Run migration, test command**

```bash
php artisan migrate
php artisan reminders:check
```

**Step 8: Commit**

```bash
git add app/ database/ routes/
git commit -m "feat: add notification system with scheduled reminder checks"
```

---

### Task 23: Frontend — Notification Badge

**Files:**
- Modify: `web/src/components/Layout.tsx`

**Step 1: Add notification badge to Layout**

Add query for notifications count and display badge on nav:
```tsx
const { data: notifications } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => api.get('/notifications').then(r => r.data.data),
  refetchInterval: 30000,
})

// In sidebar, add:
<Link to="/reminders" className="block px-3 py-2 rounded hover:bg-gray-700 relative">
  Seguimientos
  {notifications?.length > 0 && (
    <span className="absolute right-2 top-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {notifications.length}
    </span>
  )}
</Link>
```

**Step 2: Commit**

```bash
git add web/src/
git commit -m "feat: add notification badge to sidebar"
```

---

### Task 24: Final Cleanup — CLAUDE.md and README

**Files:**
- Create: `seguidor/CLAUDE.md`
- Create: `seguidor/README.md`

**Step 1: Create CLAUDE.md**

```markdown
Do not add Co-Authored-By lines to commit messages.

## Project: Seguidor

Multi-tenant CRM SaaS for small businesses.

### Structure
- `api/` — Laravel 11 API
- `web/` — React SPA (Vite + TypeScript + Tailwind)

### Development
```bash
docker compose up -d
```

API: http://localhost:8000
Frontend: http://localhost:5173

### Testing
```bash
cd api && php artisan test
```
```

**Step 2: Create README.md**

```markdown
# Seguidor

Plataforma simple para que negocios chicos y medianos ordenen clientes, consultas, presupuestos y seguimientos.

## Quick Start

```bash
docker compose up -d
```

- Frontend: http://localhost:5173
- API: http://localhost:8000
```

**Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: add CLAUDE.md and README"
```
