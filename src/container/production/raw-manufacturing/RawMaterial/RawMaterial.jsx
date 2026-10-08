import React from "react";
import { RawMaterialTable } from "./table/RawMaterialTable.jsx";

/**
 * Raw Material tab entry point.
 * Pure pass-through: all state and handlers are owned by the
 * Raw Manufacturing page (../index.jsx).
 */
export function RawMaterial(props) {
  return <RawMaterialTable {...props} />;
}
