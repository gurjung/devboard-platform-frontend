"use client";

import dynamic from "next/dynamic";
import { useSimulation } from "../context/simulation-context";

const SimulationFloatingDock = dynamic(
  () =>
    import("./simulation-floating-dock").then(
      (mod) => mod.SimulationFloatingDock
    ),
  { ssr: false }
);

export function SimulationDockGate() {
  const { isDemo } = useSimulation();
  if (!isDemo) return null;
  return <SimulationFloatingDock />;
}

