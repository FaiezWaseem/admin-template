"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ThemePreset = {
  id: "current" | "red" | "black-white" | "blue" | "teal" | "orange";
  label: string;
  description: string;
  swatches: string[];
};

const STORAGE_KEY = "theme-preset";

const presets: ThemePreset[] = [
  {
    id: "current",
    label: "Current Theme",
    description: "Uses the default app colors.",
    swatches: ["#64748b", "#a855f7", "#22c55e"],
  },
  {
    id: "red",
    label: "Red Theme",
    description: "Warmer accents and stronger alerts.",
    swatches: ["#ef4444", "#b91c1c", "#fca5a5"],
  },
  {
    id: "black-white",
    label: "Black & White",
    description: "Monochrome surfaces and accents.",
    swatches: ["#000000", "#525252", "#f5f5f5"],
  },
  {
    id: "blue",
    label: "Blue Theme",
    description: "Clean blue accent palette.",
    swatches: ["#2563eb", "#0ea5e9", "#93c5fd"],
  },
  {
    id: "teal",
    label: "Teal Theme",
    description: "Balanced teal/cyan palette for dashboards.",
    swatches: ["#0f766e", "#14b8a6", "#99f6e4"],
  },
  {
    id: "orange",
    label: "Orange Theme",
    description: "Warm orange accents with strong contrast.",
    swatches: ["#ea580c", "#f97316", "#fdba74"],
  },
];

function applyPreset(preset: ThemePreset["id"]) {
  const root = document.documentElement;
  if (preset === "current") {
    root.removeAttribute("data-theme-preset");
    localStorage.removeItem(STORAGE_KEY);
    return;
  }

  root.setAttribute("data-theme-preset", preset);
  localStorage.setItem(STORAGE_KEY, preset);
}

export function ThemePresets() {
  const [selected, setSelected] = useState<ThemePreset["id"]>("current");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ThemePreset["id"] | null;
    if (saved && presets.some((preset) => preset.id === saved)) {
      setSelected(saved);
      applyPreset(saved);
      return;
    }

    setSelected("current");
    document.documentElement.removeAttribute("data-theme-preset");
  }, []);

  return (
    <Card id="theme">
      <CardHeader>
        <CardTitle>Theme Presets</CardTitle>
        <CardDescription>
          Choose a dashboard color preset. Light/dark mode still works independently.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {presets.map((preset) => {
          const active = selected === preset.id;

          return (
            <Button
              key={preset.id}
              type="button"
              variant="outline"
              onClick={() => {
                setSelected(preset.id);
                applyPreset(preset.id);
              }}
              className={cn(
                "h-auto justify-start rounded-xl p-4 text-left",
                active && "border-primary ring-2 ring-primary/20"
              )}
            >
              <div className="flex w-full items-start gap-3">
                <div className="mt-0.5 flex items-center gap-1.5">
                  {preset.swatches.map((color) => (
                    <span
                      key={color}
                      className="h-4 w-4 rounded-full border border-black/10"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{preset.label}</span>
                    {active && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{preset.description}</p>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
