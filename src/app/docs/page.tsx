import Link from "next/link";
import { ArrowRight, BookOpen, Github } from "lucide-react";

export const metadata = {
  title: "Documentation | Admin Dashboard Template",
  description: "Guide on how to use and extend the admin dashboard template.",
};

export default function DocsPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
            <BookOpen className="h-3 w-3" />
            Admin Template Docs
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Getting started with the Admin Dashboard Template
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            This guide walks you through installing the project, understanding the
            structure, and where to plug in your own business logic.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="https://github.com/FaiezWaseem/admin-template"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs sm:text-sm hover:bg-accent transition"
            >
              <Github className="h-4 w-4" />
              View on GitHub
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-primary hover:underline"
            >
              Go to dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <section className="space-y-6 text-sm sm:text-base">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">1. Installation</h2>
            <p className="text-muted-foreground">
              Make sure you have Node.js 18 or newer installed. Then clone the
              repository and install dependencies:
            </p>
            <pre className="overflow-auto rounded-md bg-zinc-900 p-4 text-xs text-white sm:text-sm">
{`git clone https://github.com/FaiezWaseem/admin-template.git
cd admin-template
npm install`}
            </pre>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">2. Configure environment</h2>
            <p className="text-muted-foreground">
              Copy the example environment file and adjust it to your setup:
            </p>
            <pre className="overflow-auto rounded-md bg-zinc-900 p-4 text-xs text-white sm:text-sm">
{`cp .env.example .env
# edit .env with your database and auth secrets`}
            </pre>
            <p className="text-muted-foreground">
              By default the template uses SQLite for local development. For
              production you can switch to MySQL by updating <code>DATABASE_URL</code>.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">3. Database and Prisma</h2>
            <p className="text-muted-foreground">
              Generate the Prisma client, run migrations, and optionally seed the
              database with demo data:
            </p>
            <pre className="overflow-auto rounded-md bg-zinc-900 p-4 text-xs text-white sm:text-sm">
{`npx prisma generate
npx prisma migrate dev
npx prisma db seed # optional`}
            </pre>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">4. Start the app</h2>
            <p className="text-muted-foreground">
              Run the development server and open the app in your browser:
            </p>
            <pre className="overflow-auto rounded-md bg-zinc-900 p-4 text-xs text-white sm:text-sm">
{`npm run dev
# open http://localhost:3000`}
            </pre>
            <p className="text-muted-foreground">
              The public landing page lives at <code>/</code>, auth routes under{" "}
              <code>/(auth)</code>, and the main dashboard under{" "}
              <code>/dashboard</code>.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">5. Project structure</h2>
            <p className="text-muted-foreground">
              The project is organized to keep feature logic modular and easy to
              extend:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                <code>src/app/(auth)</code> – login/register flows built on
                NextAuth.
              </li>
              <li>
                <code>src/app/dashboard</code> – all dashboard pages (users,
                roles, sessions, settings, media, pages, SEO, events, email).
              </li>
              <li>
                <code>src/components</code> – shared UI built with TailwindCSS and
                shadcn/ui.
              </li>
              <li>
                <code>src/lib</code> – utilities, Prisma client, auth config, and
                helpers.
              </li>
              <li>
                <code>prisma/schema.prisma</code> – database models for users,
                roles, permissions, sessions, content, and more.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">6. Customizing for your use case</h2>
            <p className="text-muted-foreground">
              To adapt this template to your product:
            </p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>
                Update branding and layout in the dashboard shell under{" "}
                <code>src/components/layout</code>.
              </li>
              <li>
                Extend the Prisma schema and run new migrations when adding
                entities (e.g. teams, organizations, billing).
              </li>
              <li>
                Add business-specific logic under <code>src/services</code> and{" "}
                <code>src/app/api</code> routes.
              </li>
              <li>
                Wire new pages into the sidebar navigation in{" "}
                <code>Sidebar</code> for quick access.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

