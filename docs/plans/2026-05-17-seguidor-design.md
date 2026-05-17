# Seguidor — Design Document

Plataforma simple para que negocios chicos y medianos ordenen clientes, consultas, presupuestos y seguimientos en un solo lugar. Evita perder ventas por falta de seguimiento.

## Stack

- **Backend:** Laravel 11 (API REST) + Sanctum (auth SPA)
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + TanStack Query
- **Database:** MySQL 8
- **Cache/Queue:** Redis
- **Deploy:** Coolify (docker-compose con 4 servicios)

## Arquitectura

Monorepo con separación clara:

```
seguidor/
├── api/          → Laravel 11
├── web/          → React + Vite + TypeScript
└── docker-compose.yml
```

SPA React se comunica con Laravel API vía Sanctum (cookie-based auth). Multi-tenant por columna `tenant_id` con middleware automático.

## Multi-tenancy

- Columna `tenant_id` en todas las tablas de negocio
- Middleware `EnsureTenant` filtra queries automáticamente
- Trait `BelongsToTenant` en modelos
- Un usuario solo accede a datos de su tenant

## Modelo de Datos

### tenants
- id, name, slug, plan, created_at

### users
- id, tenant_id, name, email, password, role (admin/user)

### clients
- id, tenant_id, name, phone, email, source (whatsapp/instagram/web/otro)
- status (nuevo/contactado/presupuesto_enviado/seguimiento_pendiente/vendido/perdido)
- assigned_to (user_id), created_at, updated_at

### notes
- id, client_id, user_id, body, created_at

### reminders
- id, client_id, user_id, tenant_id, due_at, title, completed (bool), created_at

### templates
- id, tenant_id, name, body (con variables como {nombre}, {negocio})

## API Endpoints

### Auth
- POST /api/register — Registro de negocio (crea tenant + user admin)
- POST /api/login
- POST /api/logout

### Clients
- GET /api/clients — Listar con filtros por status y búsqueda
- POST /api/clients — Crear
- GET /api/clients/{id} — Detalle con notas y reminders
- PUT /api/clients/{id} — Editar
- DELETE /api/clients/{id} — Eliminar (soft delete)
- PATCH /api/clients/{id}/status — Cambiar estado comercial

### Notes
- POST /api/clients/{id}/notes — Agregar nota
- DELETE /api/notes/{id} — Eliminar

### Reminders
- GET /api/reminders — Listar pendientes del usuario
- POST /api/clients/{id}/reminders — Crear
- PATCH /api/reminders/{id} — Marcar completado
- DELETE /api/reminders/{id} — Eliminar

### Templates
- GET /api/templates — Listar
- POST /api/templates — Crear
- PUT /api/templates/{id} — Editar
- DELETE /api/templates/{id} — Eliminar

### Dashboard
- GET /api/dashboard — Contadores (nuevos, pendientes, vendidos, perdidos)

### Users
- GET /api/users — Listar usuarios del tenant
- POST /api/users — Invitar usuario
- DELETE /api/users/{id} — Eliminar

### WhatsApp
- GET /api/whatsapp-link/{clientId}?templateId=X — Genera link wa.me con mensaje

## Frontend

### Páginas
- /login, /register — Auth
- /dashboard — Contadores
- /clients — Tabla con filtros por estado y búsqueda
- /clients/:id — Ficha del cliente (datos, notas, reminders, botón WA)
- /reminders — Seguimientos pendientes (hoy, atrasados, próximos)
- /templates — ABM plantillas de mensajes
- /settings — Config del negocio, usuarios, perfil

### UX
- Mobile-first
- Tabla de clientes con filtros (Kanban futuro)
- Timeline de notas en ficha del cliente
- Botón WhatsApp abre wa.me con template pre-armado
- Badge de notificaciones con reminders vencidos/del día

## Seguridad

- Sanctum cookies + CSRF
- Registro crea tenant + admin en transacción
- Roles: admin y user
- Form Requests para validación
- Rate limiting en login/registro
- Soft deletes en clientes
- CORS solo para dominio del frontend

## Infraestructura

### Docker Compose
- api: Laravel (PHP 8.3 + nginx)
- web: React (build estático + nginx)
- mysql: MySQL 8
- redis: Cache + queue

### Scheduler
- Laravel scheduler cada minuto revisa reminders vencidos
- Crea notificaciones in-app para el usuario
- Redis como driver de queue

### Deploy (Coolify)
- Un proyecto con 4 servicios
- Variables de entorno por servicio
- SSL automático

## Futuro (no en v1)
- IA para generar mensajes y recomendar próximos pasos
- Vista Kanban de clientes
- API WhatsApp Business
- Notificaciones por email
- Push notifications en browser
