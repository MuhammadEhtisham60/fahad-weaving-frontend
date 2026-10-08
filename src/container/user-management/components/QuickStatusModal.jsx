import React, { useState } from "react";
import { UserCheck, X, ShieldAlert } from "lucide-react";
import { Button } from "../../../components/ui-kit.jsx";
import { USER_STATUSES } from "../utils/constants.js";

export function QuickStatusModal({ user, onConfirm, onClose }) {
  const [status, setStatus] = useState(user?.status || "Active");
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(user.id, status, reason);
  };

  const getStatusDetails = (st) => {
    switch (st) {
      case "Active":
        return {
          desc: "Full access to ERP according to assigned role permissions.",
          chip: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
        };
      case "Inactive":
        return {
          desc: "Temporarily disabled (e.g. employee on leave). User cannot log in.",
          chip: "bg-muted text-muted-foreground border-border",
        };
      case "Suspended":
        return {
          desc: "Immediate security block. All active sessions terminated.",
          chip: "bg-rose-500/15 text-rose-600 border-rose-500/30",
        };
      case "Pending":
        return {
          desc: "Awaiting onboarding document validation and HR verification.",
          chip: "bg-amber-500/15 text-amber-600 border-amber-500/30",
        };
      default:
        return { desc: "", chip: "" };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground">Update User Status</h3>
              <p className="text-xs text-muted-foreground">
                {user?.fullName} (@{user?.username})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2">
              Select Status
            </label>
            <div className="grid grid-cols-2 gap-2">
              {USER_STATUSES.map((st) => {
                const isSelected = status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/20"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{st}</span>
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          st === "Active"
                            ? "bg-emerald-500"
                            : st === "Inactive"
                            ? "bg-muted-foreground"
                            : st === "Suspended"
                            ? "bg-rose-500"
                            : "bg-amber-500"
                        }`}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg">
              {getStatusDetails(status).desc}
            </p>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1.5">
              Reason / Audit Remark (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="e.g. Return from leave, security audit recommendation, etc."
              className="w-full p-3 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Update Status</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
