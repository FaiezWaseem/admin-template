"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ChevronDown, ExternalLink, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateSiteSettings } from "@/actions/settings";
import { cn } from "@/lib/utils";
import { MediaPicker, type MediaPickerItem } from "@/components/media/media-picker";

type NavLink = { label: string; href: string; description?: string };
type NavColumn = { title: string; links: NavLink[] };
type NavItem =
  | { id: string; type: "link"; label: string; href: string }
  | { id: string; type: "dropdown"; label: string; links: NavLink[] }
  | { id: string; type: "mega"; label: string; columns: NavColumn[] };

type NavigationConfig = {
  logo?: { imageUrl?: string; text?: string; href?: string };
  alignment?: "left" | "center" | "right";
  items: NavItem[];
};

const DEFAULT_CONFIG: NavigationConfig = {
  logo: { imageUrl: "/logo.svg", text: "Admin Template", href: "/" },
  alignment: "left",
  items: [
    { id: crypto.randomUUID(), type: "link", label: "Docs", href: "/docs" },
    { id: crypto.randomUUID(), type: "link", label: "Dashboard", href: "/dashboard" },
    {
      id: crypto.randomUUID(),
      type: "dropdown",
      label: "Resources",
      links: [
        { label: "Blog", href: "/blog", description: "Latest updates" },
        { label: "Docs", href: "/docs", description: "Guides and setup" },
      ],
    },
    {
      id: crypto.randomUUID(),
      type: "mega",
      label: "Solutions",
      columns: [
        {
          title: "Platform",
          links: [
            { label: "Admin Dashboard", href: "/dashboard", description: "Control center" },
            { label: "Media Manager", href: "/dashboard/media", description: "Assets library" },
          ],
        },
        {
          title: "Content",
          links: [
            { label: "Pages", href: "/dashboard/pages", description: "Site pages" },
            { label: "Posts", href: "/dashboard/posts", description: "Blog content" },
          ],
        },
      ],
    },
  ],
};

function parseConfig(raw?: string): NavigationConfig {
  if (!raw) return DEFAULT_CONFIG;
  try {
    const parsed = JSON.parse(raw);
    return {
      logo: {
        imageUrl: parsed?.logo?.imageUrl || "/logo.svg",
        text: parsed?.logo?.text || "Admin Template",
        href: parsed?.logo?.href || "/",
      },
      alignment: ["left", "center", "right"].includes(parsed?.alignment) ? parsed.alignment : "left",
      items: Array.isArray(parsed?.items) ? parsed.items : DEFAULT_CONFIG.items,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function NavigationSettings({
  initialRaw,
  mediaItems,
}: {
  initialRaw?: string;
  mediaItems: MediaPickerItem[];
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<NavigationConfig>(() => parseConfig(initialRaw));

  const serialized = useMemo(() => JSON.stringify(config), [config]);

  async function handleSave() {
    setIsSaving(true);
    const res = await updateSiteSettings([{ key: "navigation_config", value: serialized }]);
    setIsSaving(false);
    if (res.success) {
      toast.success("Navigation updated.");
      router.refresh();
    } else {
      toast.error(res.error || "Failed to save navigation.");
    }
  }

  return (
    <div id="navigation" className="space-y-6 rounded-lg border bg-card p-6">
      <div>
        <h3 className="text-lg font-medium">Navigation</h3>
        <p className="text-sm text-muted-foreground">
          Configure public header links, dropdowns, mega menus, alignment, and logo.
        </p>
      </div>

      <div className="grid gap-4 rounded-lg border bg-muted/20 p-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Logo Text</label>
          <Input
            value={config.logo?.text || ""}
            onChange={(e) =>
              setConfig((prev) => ({ ...prev, logo: { ...(prev.logo || {}), text: e.target.value } }))
            }
            placeholder="Admin Template"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Logo Image URL</label>
          <div className="space-y-2">
            <Input
              value={config.logo?.imageUrl || ""}
              onChange={(e) =>
                setConfig((prev) => ({ ...prev, logo: { ...(prev.logo || {}), imageUrl: e.target.value } }))
              }
              placeholder="/logo.svg"
            />
            <MediaPicker
              items={mediaItems}
              value={config.logo?.imageUrl || ""}
              onSelect={(url) =>
                setConfig((prev) => ({ ...prev, logo: { ...(prev.logo || {}), imageUrl: url } }))
              }
              onClear={() =>
                setConfig((prev) => ({ ...prev, logo: { ...(prev.logo || {}), imageUrl: "" } }))
              }
              triggerLabel="Choose Logo from Media"
              title="Select Logo Image"
              description="Pick an image from Media Manager for the site logo."
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Navigation Alignment</label>
          <Select
            value={config.alignment || "left"}
            onValueChange={(value: "left" | "center" | "right") =>
              setConfig((prev) => ({ ...prev, alignment: value }))
            }
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-background p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium">Navigation Preview</p>
          <span className="text-xs text-muted-foreground">Desktop preview</span>
        </div>
        <div className="rounded-lg border bg-card p-3">
          <div className="flex items-center gap-3">
            <Link href={config.logo?.href || "/"} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={config.logo?.imageUrl || "/logo.svg"} alt="Logo" className="h-6 w-6 rounded-sm object-contain" />
              <span className="text-sm font-semibold">{config.logo?.text || "Admin Template"}</span>
            </Link>
            <div
              className={cn(
                "ml-auto hidden flex-1 items-center gap-2 md:flex",
                config.alignment === "left" && "justify-start",
                config.alignment === "center" && "justify-center",
                config.alignment === "right" && "justify-end"
              )}
            >
              {config.items.map((item) => (
                <div key={item.id} className="rounded-md border bg-muted/30 px-2 py-1 text-xs">
                  {item.label} {item.type !== "link" && <span className="text-muted-foreground">({item.type})</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              items: [...prev.items, { id: crypto.randomUUID(), type: "link", label: "New Link", href: "/" }],
            }))
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Link
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              items: [
                ...prev.items,
                { id: crypto.randomUUID(), type: "dropdown", label: "Dropdown", links: [{ label: "Item", href: "/" }] },
              ],
            }))
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Dropdown
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setConfig((prev) => ({
              ...prev,
              items: [
                ...prev.items,
                { id: crypto.randomUUID(), type: "mega", label: "Mega Menu", columns: [{ title: "Column 1", links: [] }] },
              ],
            }))
          }
        >
          <Plus className="mr-2 h-4 w-4" /> Add Mega Menu
        </Button>
      </div>

      <div className="space-y-4">
        {config.items.map((item, itemIndex) => (
          <div key={item.id} className="rounded-lg border p-4">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {item.type === "link" ? "Normal Link" : item.type === "dropdown" ? "Dropdown" : "Mega Menu"}
                </span>
                <Select
                  value={item.type}
                  onValueChange={(value: "link" | "dropdown" | "mega") => {
                    setConfig((prev) => {
                      const next = structuredClone(prev);
                      const current = next.items[itemIndex];
                      if (value === current.type) return next;
                      if (value === "link") {
                        next.items[itemIndex] = { id: current.id, type: "link", label: current.label, href: "/" };
                      } else if (value === "dropdown") {
                        next.items[itemIndex] = { id: current.id, type: "dropdown", label: current.label, links: [] };
                      } else {
                        next.items[itemIndex] = { id: current.id, type: "mega", label: current.label, columns: [] };
                      }
                      return next;
                    });
                  }}
                >
                  <SelectTrigger className="h-8 w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="link">Normal Link</SelectItem>
                    <SelectItem value="dropdown">Dropdown</SelectItem>
                    <SelectItem value="mega">Mega Menu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600"
                onClick={() => setConfig((prev) => ({ ...prev, items: prev.items.filter((_, i) => i !== itemIndex) }))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <Input
              className="mb-3"
              value={item.label}
              onChange={(e) =>
                setConfig((prev) => {
                  const next = structuredClone(prev);
                  (next.items[itemIndex] as any).label = e.target.value;
                  return next;
                })
              }
              placeholder="Menu label"
            />

            {item.type === "link" && (
              <Input
                value={item.href}
                onChange={(e) =>
                  setConfig((prev) => {
                    const next = structuredClone(prev);
                    (next.items[itemIndex] as any).href = e.target.value;
                    return next;
                  })
                }
                placeholder="/path or https://..."
              />
            )}

            {item.type === "dropdown" && (
              <div className="space-y-2">
                {item.links.map((link, linkIndex) => (
                  <div key={`${item.id}-${linkIndex}`} className="grid gap-2 rounded border bg-muted/10 p-2 md:grid-cols-3">
                    <Input
                      value={link.label}
                      onChange={(e) =>
                        setConfig((prev) => {
                          const next = structuredClone(prev);
                          (next.items[itemIndex] as any).links[linkIndex].label = e.target.value;
                          return next;
                        })
                      }
                      placeholder="Label"
                    />
                    <Input
                      value={link.href}
                      onChange={(e) =>
                        setConfig((prev) => {
                          const next = structuredClone(prev);
                          (next.items[itemIndex] as any).links[linkIndex].href = e.target.value;
                          return next;
                        })
                      }
                      placeholder="/path"
                    />
                    <div className="flex gap-2">
                      <Input
                        value={link.description || ""}
                        onChange={(e) =>
                          setConfig((prev) => {
                            const next = structuredClone(prev);
                            (next.items[itemIndex] as any).links[linkIndex].description = e.target.value;
                            return next;
                          })
                        }
                        placeholder="Description (optional)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-600"
                        onClick={() =>
                          setConfig((prev) => {
                            const next = structuredClone(prev);
                            (next.items[itemIndex] as any).links.splice(linkIndex, 1);
                            return next;
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setConfig((prev) => {
                      const next = structuredClone(prev);
                      (next.items[itemIndex] as any).links.push({ label: "New Item", href: "/" });
                      return next;
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Dropdown Link
                </Button>
              </div>
            )}

            {item.type === "mega" && (
              <div className="space-y-3">
                {item.columns.map((col, colIndex) => (
                  <div key={`${item.id}-${colIndex}`} className="rounded-md border bg-muted/10 p-3">
                    <div className="mb-2 flex gap-2">
                      <Input
                        value={col.title}
                        onChange={(e) =>
                          setConfig((prev) => {
                            const next = structuredClone(prev);
                            (next.items[itemIndex] as any).columns[colIndex].title = e.target.value;
                            return next;
                          })
                        }
                        placeholder="Column title"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-red-600"
                        onClick={() =>
                          setConfig((prev) => {
                            const next = structuredClone(prev);
                            (next.items[itemIndex] as any).columns.splice(colIndex, 1);
                            return next;
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {col.links.map((link, linkIndex) => (
                        <div key={`${item.id}-${colIndex}-${linkIndex}`} className="grid gap-2 rounded border bg-background p-2 md:grid-cols-3">
                          <Input
                            value={link.label}
                            onChange={(e) =>
                              setConfig((prev) => {
                                const next = structuredClone(prev);
                                (next.items[itemIndex] as any).columns[colIndex].links[linkIndex].label = e.target.value;
                                return next;
                              })
                            }
                            placeholder="Link label"
                          />
                          <Input
                            value={link.href}
                            onChange={(e) =>
                              setConfig((prev) => {
                                const next = structuredClone(prev);
                                (next.items[itemIndex] as any).columns[colIndex].links[linkIndex].href = e.target.value;
                                return next;
                              })
                            }
                            placeholder="/path"
                          />
                          <div className="flex gap-2">
                            <Input
                              value={link.description || ""}
                              onChange={(e) =>
                                setConfig((prev) => {
                                  const next = structuredClone(prev);
                                  (next.items[itemIndex] as any).columns[colIndex].links[linkIndex].description = e.target.value;
                                  return next;
                                })
                              }
                              placeholder="Description"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-red-600"
                              onClick={() =>
                                setConfig((prev) => {
                                  const next = structuredClone(prev);
                                  (next.items[itemIndex] as any).columns[colIndex].links.splice(linkIndex, 1);
                                  return next;
                                })
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setConfig((prev) => {
                            const next = structuredClone(prev);
                            (next.items[itemIndex] as any).columns[colIndex].links.push({ label: "New Item", href: "/" });
                            return next;
                          })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Column Link
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setConfig((prev) => {
                      const next = structuredClone(prev);
                      (next.items[itemIndex] as any).columns.push({ title: "New Column", links: [] });
                      return next;
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Column
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3">
        <Button type="button" variant="ghost" asChild>
          <Link href="/dashboard/media" target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" /> Open Media Manager (for logo)
          </Link>
        </Button>
        <Button type="button" onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Navigation
        </Button>
      </div>

      <details className="rounded-md border bg-muted/10 p-3">
        <summary className="cursor-pointer text-sm font-medium">Advanced JSON</summary>
        <Textarea value={serialized} readOnly className="mt-3 min-h-[140px] font-mono text-xs" />
      </details>
    </div>
  );
}
