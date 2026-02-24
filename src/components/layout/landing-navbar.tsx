"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Github, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { HoveredLink, Menu, MenuItem } from "@/components/ui/navbar-menu";

type NavLink = { label: string; href: string; description?: string; imageUrl?: string };
type NavColumn = { title: string; links: NavLink[] };
type NavItem =
  | { id?: string; type: "link"; label: string; href: string }
  | { id?: string; type: "dropdown"; label: string; links: NavLink[] }
  | { id?: string; type: "mega"; label: string; columns: NavColumn[] };

type NavigationConfig = {
  logo?: { imageUrl?: string; text?: string; href?: string };
  alignment?: "left" | "center" | "right";
  items: NavItem[];
};

export function LandingNavbar({ navigationConfig }: { navigationConfig: NavigationConfig }) {
  const [active, setActive] = useState<string | null>(null);

  const grouped = useMemo(() => {
    const links = navigationConfig.items.filter((i) => i.type === "link") as Extract<NavItem, { type: "link" }>[];
    const menus = navigationConfig.items.filter((i) => i.type !== "link") as Array<
      Extract<NavItem, { type: "dropdown" }> | Extract<NavItem, { type: "mega" }>
    >;
    return { links, menus };
  }, [navigationConfig.items]);

  const justifyClass =
    navigationConfig.alignment === "center"
      ? "justify-center"
      : navigationConfig.alignment === "right"
      ? "justify-end"
      : "justify-start";

  return (
    <header className="fixed inset-x-0 top-0 z-[100] px-4 pt-4">
      <div className="mx-auto max-w-7xl rounded-2xl border bg-background/70 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <Link href={navigationConfig.logo?.href || "/"} className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={navigationConfig.logo?.imageUrl || "/logo.svg"}
              alt="Logo"
              className="h-8 w-8 rounded-md object-contain"
            />
            <span className="text-sm font-semibold tracking-wide text-foreground">
              {navigationConfig.logo?.text || "Admin Template"}
            </span>
          </Link>

          <div className={cn("hidden flex-1 items-center gap-4 md:flex", justifyClass)}>
            {grouped.links.map((item, idx) => (
              <HoveredLink
                key={`${item.label}-${idx}`}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                {item.label}
              </HoveredLink>
            ))}

            {grouped.menus.length > 0 && (
              <Menu setActive={setActive}>
                {grouped.menus.map((item, idx) => (
                  <MenuItem
                    key={`${item.label}-${idx}`}
                    setActive={(label) => setActive(label)}
                    active={active}
                    item={item.label}
                  >
                    {item.type === "dropdown" ? (
                      <div className="flex min-w-64 flex-col space-y-3 text-sm">
                        {item.links?.map((link, lIdx) => (
                          <div key={`${link.label}-${lIdx}`} className="space-y-0.5">
                            <HoveredLink href={link.href}>{link.label}</HoveredLink>
                            {link.description && (
                              <p className="text-xs text-muted-foreground">{link.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid gap-4 p-1 md:min-w-[42rem] md:grid-cols-2">
                        {item.columns?.map((column, cIdx) => (
                          <div key={`${column.title}-${cIdx}`} className="rounded-xl border bg-card/60 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {column.title}
                            </p>
                            <div className="space-y-1">
                              {column.links?.map((link, lIdx) => (
                                <Link
                                  key={`${link.label}-${lIdx}`}
                                  href={link.href}
                                  className="block rounded-md px-2 py-2 hover:bg-accent transition"
                                >
                                  <div className="flex items-start gap-3">
                                    {link.imageUrl && (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img
                                        src={link.imageUrl}
                                        alt={link.label}
                                        className="h-12 w-16 rounded-md border object-cover"
                                      />
                                    )}
                                    <div>
                                      <div className="text-sm font-medium text-foreground">{link.label}</div>
                                      {link.description && (
                                        <div className="text-xs text-muted-foreground">{link.description}</div>
                                      )}
                                    </div>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </MenuItem>
                ))}
              </Menu>
            )}
          </div>

          <div className="ml-auto hidden items-center gap-2 md:flex">
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
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background shadow hover:opacity-90 transition"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </div>

          <div className="ml-auto md:hidden">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-foreground px-3 py-1.5 text-sm text-background"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
