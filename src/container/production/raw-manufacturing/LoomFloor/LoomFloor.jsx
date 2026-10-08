import React from "react";
import { LoomTable } from "./table/LoomTable.jsx";

/**
 * Loom Floor tab entry point.
 * Pure pass-through: all state and handlers are owned by the
 * Raw Manufacturing page (../index.jsx).
 */
export function LoomFloor(props) {
  return <LoomTable {...props} />;
}
