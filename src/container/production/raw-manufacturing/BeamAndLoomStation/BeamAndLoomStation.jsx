import React from "react";
import { BeamLoomAssignmentView } from "./components/BeamLoomAssignmentView.jsx";

/**
 * Beam & Loom Station tab entry point.
 * Pure pass-through: all state and handlers are owned by the
 * Raw Manufacturing page (../index.jsx).
 */
export function BeamAndLoomStation(props) {
  return <BeamLoomAssignmentView {...props} />;
}
