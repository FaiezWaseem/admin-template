"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SettingsForm } from "@/components/settings/settings-form";
import { NavigationSettings } from "@/components/settings/navigation-settings";
import { ThemePresets } from "@/components/settings/theme-presets";
import type { MediaPickerItem } from "@/components/media/media-picker";

type TabKey = "general" | "navigation" | "theme";

function hashToTab(hash: string): TabKey {
  if (hash === "#navigation") return "navigation";
  if (hash === "#theme") return "theme";
  return "general";
}

export function SettingsTabs({
  initialData,
  mediaItems,
}: {
  initialData: Record<string, string>;
  mediaItems: MediaPickerItem[];
}) {
  const [tab, setTab] = useState<TabKey>("general");

  useEffect(() => {
    setTab(hashToTab(window.location.hash));

    const onHashChange = () => setTab(hashToTab(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleTabChange = (value: string) => {
    const next = value as TabKey;
    setTab(next);
    const hash = next === "general" ? "" : `#${next}`;
    history.replaceState(null, "", `${window.location.pathname}${hash}`);
  };

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3 md:w-auto">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="navigation">Navigation</TabsTrigger>
        <TabsTrigger value="theme">Theme</TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="space-y-6">
        <SettingsForm initialData={initialData} />
      </TabsContent>

      <TabsContent value="navigation" className="space-y-6">
        <NavigationSettings initialRaw={initialData.navigation_config} mediaItems={mediaItems} />
      </TabsContent>

      <TabsContent value="theme" className="space-y-6">
        <ThemePresets />
      </TabsContent>
    </Tabs>
  );
}
