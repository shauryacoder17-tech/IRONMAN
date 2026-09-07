"use client";

import { useState } from "react";
import Landing from "@/components/landing/Landing";
import Dashboard from "@/components/dashboard/Dashboard";

type View = "landing" | "booting" | "dashboard";

export default function AppShell() {
  const [view, setView] = useState<View>("landing");

  function activate() {
    setView("booting");
    setTimeout(() => setView("dashboard"), 1200);
  }

  if (view === "dashboard") return <Dashboard />;

  return <Landing onActivate={activate} isBooting={view === "booting"} />;
}
