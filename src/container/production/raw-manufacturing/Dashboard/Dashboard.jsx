import React from "react";
import { ManufacturingDashboard } from "./components/ManufacturingDashboard.jsx";

/**
 * Dashboard tab entry point.
 * Pure pass-through: all state and handlers are owned by the
 * Raw Manufacturing page (../index.jsx).
 */
export function Dashboard(props) {
  return <ManufacturingDashboard {...props} />;
}
