import React, { useState } from "react";
import { X, Sliders, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  useGetBeamChoicesQuery,
  usePatchBeamMutation,
} from "../../../../store/index.js";
import { StatusBadge } from "../../../../components/ui-kit.jsx";

export function BeamStatusModal({ beam, onClose }) {
  const { data: choicesData } = useGetBeamChoicesQuery();
  const [patchBeam, { isLoading: isPatching }] = usePatchBeamMutation();

  const [selectedStatus, setSelectedStatus] = useState(beam?.status || "Available");
  const [notes, setNotes] = useState("");

  const statusChoices = choicesData?.statusChoices || [
    { value: "Available", label: "Available" },
    { value: "Sizing", label: "Sizing" },
    { value: "Loaded", label: "Loaded" },
    { value: "In Production", label: "In Production" },
    { value: "Completed", label: "Completed" },
    { value: "Damaged", label: "Damaged" },
    { value: "Inactive", label: "Inactive" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!beam) return;

    try {
      const payload = {
        id: beam.id,
        status: selectedStatus,
      };
      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      await patchBeam(payload).unwrap();
      toast.success(`Status updated to "${selectedStatus}".`);
      onClose();
    } catch {
      // Global error handler handles toast
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Change Beam Status</h3>
              <p className="text-xs text-muted-foreground">
                {beam.beamName ? `${beam.beamNumber} - ${beam.beamName}` : beam.beamNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Current Status:</span>
          <StatusBadge status={beam.status || "Available"} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-2 text-foreground">
              New Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {statusChoices.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setSelectedStatus(c.value)}
                  className={`px-3 py-2 rounded-lg border text-xs font-semibold transition-all text-left flex items-center justify-between ${
                    selectedStatus === c.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  <span>{c.label}</span>
                  {selectedStatus === c.value && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-foreground">
              Status Change Remark (Optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Loaded onto Loom L-005 for production run..."
              className="w-full p-2.5 rounded-lg bg-background border border-border text-xs focus:border-ring outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPatching}
              className="h-9 px-4 rounded-lg border border-border bg-card text-foreground font-semibold text-xs hover:bg-muted transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPatching}
              className="h-9 px-5 rounded-lg bg-gradient-primary text-primary-foreground font-semibold text-xs shadow-glow hover:opacity-90 transition-opacity flex items-center gap-1.5 disabled:opacity-50"
            >
              {isPatching && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Update Status
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
