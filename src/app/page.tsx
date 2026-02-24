import Link from "next/link";
import { ArrowRight, Github, LogIn, UserPlus } from "lucide-react";

export const dynamic = "force-static";

export default async function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background to-muted/20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,_#60a5fa_18%,transparent_45%)] opacity-15 blur-3xl animate-float-slow" />
      </div>

      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="h-7 w-7" />
            <span className="text-sm font-semibold tracking-wide text-foreground">
              Admin Template
            </span>
          </div>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition">
              Docs
            </Link>
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition">
              Dashboard
            </Link>
            <a
              href="https://github.com/FaiezWaseem/admin-template"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm hover:bg-accent transition"
            >
              <Github className="h-4 w-4" />
              GitHub
            </a>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md  px-4 py-2 text-sm font-medium text-zinc-900 shadow hover:opacity-90 transition"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </nav>
          <div className="md:hidden">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-1.5 text-sm text-background"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <section className="relative px-6 py-16 md:py-24">
        <div className="mx-auto max-w-6xl text-center space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-sm text-muted-foreground backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Now in Next.js App Router
          </div>
          <h1 className="text-balance bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent md:text-7xl">
            Build Internal Tools Faster
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
            A modern, modular dashboard foundation powered by Next.js, Tailwind, Prisma, and shadcn/ui.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-violet-500/25 transition hover:opacity-90"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </Link>
            <Link
              href="/dashboard"
              className="group inline-flex items-center gap-2 rounded-md border bg-card px-6 py-3 text-sm font-medium shadow hover:bg-accent transition"
            >
              Explore Dashboard
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </section>

      <section id="docs" className="mx-auto mt-6 max-w-6xl space-y-4 px-6">
        <div className="rounded-xl border bg-zinc-900/95 text-zinc-200 shadow-[0_0_0_1px_rgba(255,255,255,0.06)] backdrop-blur">
          <div className="flex items-center gap-2 border-b border-zinc-800/80 px-4 py-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="h-3 w-3 rounded-full bg-yellow-400" />
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <span className="ml-3 text-xs text-zinc-400">Dashboard Preview</span>
          </div>
          <div className="rounded-b-xl border-t border-zinc-800/60 bg-zinc-950 p-3 md:p-4">
            <img
              src="/image.png"
              alt="Dashboard preview"
              className="h-auto w-full rounded-lg border border-zinc-800 object-cover"
            />
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Preview of the admin dashboard UI.
        </p>
      </section>

      <footer className="mt-16 border-t bg-background/70 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
            <span className="text-sm text-muted-foreground">Admin Template</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/login" className="text-muted-foreground hover:text-foreground transition">Sign In</Link>
            <Link href="/register" className="text-muted-foreground hover:text-foreground transition">Create Account</Link>
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition">Dashboard</Link>
            <a href="#docs" className="text-muted-foreground hover:text-foreground transition">Docs</a>
          </div>
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Built with Next.js · Tailwind · shadcn/ui
          </p>
        </div>
      </footer>
    </main>
  );
}

