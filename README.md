<p align="center">
  <img src="public/logo.svg" alt="Admin Template" width="80" height="80" />
</p>

<h1 align="center">Admin Dashboard Template</h1>

<p align="center">
  A high-performance, modular internal hub tailored for scalability and ease of use.<br/>
  Built with Next.js · Prisma · TailwindCSS · Shadcn/UI
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#project-structure">Project Structure</a> ·
  <a href="#environment-variables">Environment</a> ·
  <a href="#requirements-checklist">Checklist</a>
</p>

---

## Features

### 🔐 Advanced Access & Identity Control

| Feature | Description | Status |
|---|---|---|
| Granular RBAC | Custom permissions down to the button level | ☐ |
| User Management | Full directory for profiles, status toggles, and activity logs | ☐ |
| DB Sessions | Stateful browser sessions persisted in the database | ☐ |
| JWT Sessions | Stateless, secure API communication tokens | ☐ |
| Multi-Session Management | Revocable sessions — remotely terminate active sessions across devices | ☐ |

### ⚙️ Dynamic Configuration & Communication

| Feature | Description | Status |
|---|---|---|
| Dynamic Site Config | Update branding, logos, and maintenance mode in real-time without redeployment | ☐ |
| Email Gateway | Unified interface supporting SMTP, SendGrid, and Amazon SES | ☐ |
| System Events & Notifications | Custom event triggers (e.g., New User, Payment Failure) with multi-channel routing | ☐ |

### 📄 Content & SEO Engine

| Feature | Description | Status |
|---|---|---|
| Custom Page Generation | Drag-and-drop or template-based builder for landing/informational pages | ☐ |
| Deep SEO Control | Per-page meta tags, OpenGraph images, and sitemap controls | ☐ |
| Centralized Media Manager | Unified asset bucket with local filesystem or AWS S3 storage and image optimization | ☐ |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| **[Next.js](https://nextjs.org/)** | Server-side rendering, API routes, and file-based routing |
| **[TailwindCSS](https://tailwindcss.com/)** | Utility-first CSS framework for rapid, consistent styling |
| **[Shadcn/UI](https://ui.shadcn.com/)** | Accessible, composable component library built on Radix UI |
| **[Framer Motion](https://www.framer.com/motion/)** | Subtle, meaningful transitions and micro-interactions |

### Backend & Persistence

| Technology | Purpose |
|---|---|
| **[Prisma](https://www.prisma.io/)** | Type-safe ORM for database access and migrations |
| **SQLite** | Lightweight database for development and edge deployments |
| **MySQL** | Production-grade relational database for scaling |
| **Node.js EventEmitter** | Custom system event triggers and hooks |

### Authentication & Sessions

| Mechanism | Use Case |
|---|---|
| **DB Sessions** | Stateful browser authentication with server-side persistence |
| **JWT Sessions** | Stateless API authentication with revocation list support |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **pnpm**
- **SQLite** (default) or **MySQL** for production

### Installation

```bash
# Clone the repository
git clone <repo-url> admin-template
cd admin-template

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev

# Seed the database (optional)
npx prisma db seed

# Start the development server
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
admin-template/
├── prisma/
│   ├── schema.prisma          # Database schema (SQLite + MySQL)
│   ├── migrations/            # Prisma migrations
│   └── seed.ts                # Database seeder
├── public/                    # Static assets
├── src/
│   ├── app/                   # Next.js App Router pages & layouts
│   │   ├── (auth)/            # Authentication routes
│   │   ├── (dashboard)/       # Protected dashboard routes
│   │   │   ├── users/         # User management
│   │   │   ├── roles/         # RBAC management
│   │   │   ├── sessions/      # Session control
│   │   │   ├── settings/      # Dynamic site config
│   │   │   ├── media/         # Media library
│   │   │   ├── pages/         # Page builder
│   │   │   ├── seo/           # SEO suite
│   │   │   ├── events/        # Event builder
│   │   │   └── email/         # Email gateway config
│   │   └── api/               # API routes
│   ├── components/            # Shared UI components (Shadcn/UI)
│   ├── lib/                   # Utilities, Prisma client, helpers
│   ├── hooks/                 # Custom React hooks
│   ├── services/              # Business logic (email, storage, events)
│   └── types/                 # TypeScript type definitions
├── .env.example               # Environment variable template
├── tailwind.config.ts         # TailwindCSS configuration
├── next.config.ts             # Next.js configuration
├── tsconfig.json              # TypeScript configuration
└── package.json
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# ─── Database ────────────────────────────────────────
# SQLite (default for development)
DATABASE_URL="file:./dev.db"
# MySQL (uncomment for production)
# DATABASE_URL="mysql://user:password@host:3306/admin_db"

# ─── Authentication ──────────────────────────────────
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
JWT_SECRET="your-jwt-secret"

# ─── Email Gateway ───────────────────────────────────
# Provider: "smtp" | "sendgrid" | "ses"
EMAIL_PROVIDER="smtp"

# SMTP
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="user@example.com"
SMTP_PASS="password"

# SendGrid
SENDGRID_API_KEY=""

# Amazon SES
AWS_SES_REGION=""
AWS_SES_ACCESS_KEY=""
AWS_SES_SECRET_KEY=""

# ─── Storage ─────────────────────────────────────────
# Provider: "local" | "s3"
STORAGE_PROVIDER="local"
STORAGE_LOCAL_DIR="./uploads"

# AWS S3
AWS_S3_BUCKET=""
AWS_S3_REGION=""
AWS_S3_ACCESS_KEY=""
AWS_S3_SECRET_KEY=""

# ─── App ─────────────────────────────────────────────
NEXT_PUBLIC_APP_NAME="Admin Dashboard"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Requirements Checklist

> Track implementation progress for every feature and sub-system.

### 🔐 Access & Identity Control

- [ ] **Role-Based Access Control (RBAC)**
  - [ ] Define `Role` and `Permission` models in Prisma schema
  - [ ] Create role management CRUD pages
  - [ ] Implement permission assignment UI (button-level granularity)
  - [ ] Add middleware/guards for route & API protection
  - [ ] Build permission-checking hooks (`usePermission`, `useRole`)
- [ ] **User Management**
  - [ ] Create `User` model with profile fields
  - [ ] Build user directory page with search, filter, and pagination
  - [ ] Implement profile detail/edit views
  - [ ] Add status toggle (active/suspended/banned)
  - [ ] Build activity log viewer per user
- [ ] **Session Management**
  - [ ] Implement DB-persisted session strategy
  - [ ] Implement JWT session strategy with refresh tokens
  - [ ] Build session viewer (list active sessions per user/device)
  - [ ] Add "Revoke Session" and "Logout All Devices" actions
  - [ ] Implement JWT revocation list for invalidating tokens

### ⚙️ Dynamic Configuration & Communication

- [ ] **Dynamic Site Configuration**
  - [ ] Create `SiteConfig` model for key-value settings
  - [ ] Build settings page for branding (name, logo, favicon)
  - [ ] Implement maintenance mode toggle with banner
  - [ ] Apply config changes in real-time (no redeploy)
- [ ] **Email Gateway**
  - [ ] Define unified email service interface
  - [ ] Implement SMTP adapter
  - [ ] Implement SendGrid adapter
  - [ ] Implement Amazon SES adapter
  - [ ] Build gateway config UI with provider switching
  - [ ] Add email sending test functionality
- [ ] **System Events & Notifications**
  - [ ] Define `Event` and `Notification` models
  - [ ] Implement Node.js EventEmitter-based event bus
  - [ ] Build event builder UI (create/edit custom event triggers)
  - [ ] Implement multi-channel notification routing (email, in-app, webhook)
  - [ ] Add event log/history viewer

### 📄 Content & SEO Engine

- [ ] **Custom Page Generation**
  - [ ] Define `Page` model with content, slug, and status
  - [ ] Build template-based page builder UI
  - [ ] Implement drag-and-drop block editor
  - [ ] Add page preview and publish/unpublish flow
  - [ ] Support dynamic routing for generated pages
- [ ] **Deep SEO Control**
  - [ ] Define `SEOMeta` model (title, description, OG image, canonical, etc.)
  - [ ] Build per-page SEO editor with real-time Google preview
  - [ ] Implement OpenGraph image upload/generation
  - [ ] Add automatic sitemap.xml generation
  - [ ] Integrate with Next.js Metadata API
- [ ] **Centralized Media Manager**
  - [ ] Define `Media` model for asset metadata
  - [ ] Build media library UI with grid/list views
  - [ ] Implement drag-and-drop file upload
  - [ ] Implement local filesystem storage adapter
  - [ ] Implement AWS S3 storage adapter
  - [ ] Add built-in image optimization (resize, compress, format conversion)
  - [ ] Support file type filtering and search

### 🏗️ Infrastructure & Setup

- [ ] **Prisma Schema & Database**
  - [ ] Design complete Prisma schema supporting SQLite and MySQL
  - [ ] Create initial migration
  - [ ] Write database seeder for default roles, admin user, and sample data
- [ ] **Next.js Project Setup**
  - [ ] Initialize Next.js with App Router and TypeScript
  - [ ] Configure TailwindCSS and Shadcn/UI
  - [ ] Set up Framer Motion for page transitions
  - [ ] Create base layout with sidebar navigation
  - [ ] Implement responsive dashboard shell
- [ ] **Authentication**
  - [ ] Set up NextAuth.js (or custom auth) with dual-session support
  - [ ] Build login, register, and forgot-password pages
  - [ ] Implement protected route middleware
- [ ] **API Layer**
  - [ ] Design RESTful API routes under `src/app/api/`
  - [ ] Add request validation (Zod)
  - [ ] Implement standardized error handling and response format

### 🧪 Quality & DevOps

- [ ] **Testing**
  - [ ] Set up Jest / Vitest for unit tests
  - [ ] Add integration tests for critical API routes
  - [ ] Add E2E tests (Playwright or Cypress) for core flows
- [ ] **CI/CD & Deployment**
  - [ ] Create Docker / docker-compose setup
  - [ ] Add GitHub Actions workflow for lint, test, and build
  - [ ] Document deployment to Vercel / self-hosted environments

---

## UI Feature Matrix

| Feature | Functionality | Tech Integration | Status |
|---|---|---|---|
| **Media Library** | Centralized drag-and-drop uploads | AWS S3 / Local Storage | ☐ |
| **SEO Suite** | Real-time meta & SERP preview | Next.js Metadata API | ☐ |
| **Event Builder** | Create custom triggers & hooks | Node.js EventEmitter | ☐ |
| **Session Control** | One-click "Logout All Devices" | SQL / JWT Revocation List | ☐ |
| **Page Builder** | Template & block-based page creation | Next.js Dynamic Routes | ☐ |
| **Email Gateway** | Provider switching & test send | SMTP / SendGrid / SES | ☐ |
| **Site Config** | Real-time branding & maintenance mode | Prisma + SWR/React Query | ☐ |
| **User Directory** | Search, filter, bulk actions | Prisma + Server Components | ☐ |
| **RBAC Manager** | Visual permission matrix | Prisma + Middleware | ☐ |

---

## Database Schema Overview

```mermaid
erDiagram
    User ||--o{ Session : has
    User ||--o{ ActivityLog : generates
    User }o--|| Role : "assigned to"
    Role ||--o{ RolePermission : contains
    Permission ||--o{ RolePermission : "granted via"

    SiteConfig {
        string key PK
        string value
        string type
    }

    User {
        string id PK
        string email
        string name
        string status
        datetime createdAt
    }

    Role {
        string id PK
        string name
        string description
    }

    Permission {
        string id PK
        string name
        string resource
        string action
    }

    Session {
        string id PK
        string userId FK
        string type
        string device
        boolean revoked
        datetime expiresAt
    }

    Page {
        string id PK
        string title
        string slug
        json content
        string status
    }

    SEOMeta {
        string id PK
        string pageId FK
        string title
        string description
        string ogImage
    }

    Media {
        string id PK
        string filename
        string url
        string provider
        int size
    }

    Event {
        string id PK
        string name
        string trigger
        json channels
    }

    Notification {
        string id PK
        string eventId FK
        string userId FK
        string channel
        string status
    }
```

---

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma database GUI
npx prisma migrate dev    # Run database migrations
npx prisma db seed        # Seed the database
```

---

## License

MIT

---

<p align="center">
  Built with ❤️ using Next.js, Prisma, TailwindCSS & Shadcn/UI
</p>
