import React from "react";
import { SizingTable } from "./table/SizingTable.jsx";

/**
 * Sizing Process tab entry point.
 * Pure pass-through: all state and handlers are owned by the
 * Raw Manufacturing page (../index.jsx).
 */
export function SizingProcess(props) {
  return <SizingTable {...props} />;
}
