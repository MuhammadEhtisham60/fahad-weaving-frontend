import React, { useState } from "react";
import {
  ShieldCheck,
  CheckSquare,
  Square,
  Search,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sliders,
  Layers,
} from "lucide-react";
import { PERMISSION_MODULES, ALL_PERMISSION_IDS } from "../utils/constants.js";

export function PermissionMatrix({
  selectedPermissions = [],
  onChange,
  readOnly = false,
  roleName = "",
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedModules, setExpandedModules] = useState(() =>
    PERMISSION_MODULES.reduce((acc, m) => ({ ...acc, [m.id]: true }), {})
  );

  const toggleModuleExpand = (moduleId) => {
    setExpandedModules((prev) => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const expandAll = () => {
    setExpandedModules(PERMISSION_MODULES.reduce((acc, m) => ({ ...acc, [m.id]: true }), {}));
  };

  const collapseAll = () => {
    setExpandedModules({});
  };

  const isAllSelected =
    ALL_PERMISSION_IDS.length > 0 &&
    ALL_PERMISSION_IDS.every((id) => selectedPermissions.includes(id));

  const handleToggleAll = () => {
    if (readOnly || !onChange) return;
    if (isAllSelected) {
      onChange([]);
    } else {
      onChange([...ALL_PERMISSION_IDS]);
    }
  };

  const handleToggleModule = (modulePermissions) => {
    if (readOnly || !onChange) return;
    const modPermIds = modulePermissions.map((p) => p.id);
    const allModSelected = modPermIds.every((id) => selectedPermissions.includes(id));

    if (allModSelected) {
      // Remove all module permissions
      onChange(selectedPermissions.filter((id) => !modPermIds.includes(id)));
    } else {
      // Add missing module permissions
      const newSelected = Array.from(new Set([...selectedPermissions, ...modPermIds]));
      onChange(newSelected);
    }
  };

  const handleToggleSingle = (permId) => {
    if (readOnly || !onChange) return;
    if (selectedPermissions.includes(permId)) {
      onChange(selectedPermissions.filter((id) => id !== permId));
    } else {
      onChange([...selectedPermissions, permId]);
    }
  };

  // Filter modules and permissions by search
  const filteredModules = PERMISSION_MODULES.map((mod) => {
    const matchingPerms = mod.permissions.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      ...mod,
      permissions: matchingPerms,
      isVisible: matchingPerms.length > 0,
    };
  }).filter((m) => m.isVisible);

  return (
    <div className="space-y-4">
      {/* Matrix Controls Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-2xl bg-card border border-border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-foreground">
                {roleName ? `Permissions for ${roleName}` : "System Permission Matrix"}
              </h4>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/15 text-primary">
                {selectedPermissions.length} / {ALL_PERMISSION_IDS.length} Active
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {readOnly
                ? "Read-only view of role capability scope"
                : "Select actions and operational boundaries for this access profile"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              type="button"
              onClick={handleToggleAll}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-smooth ${
                isAllSelected
                  ? "bg-destructive/15 text-destructive border border-destructive/20 hover:bg-destructive/25"
                  : "bg-primary text-primary-foreground shadow-sm hover:opacity-90"
              }`}
            >
              {isAllSelected ? "Deselect All" : "Grant All (Super Admin)"}
            </button>
          )}

          <div className="flex items-center gap-1 border-l border-border pl-2">
            <button
              type="button"
              onClick={expandAll}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              Expand All
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              type="button"
              onClick={collapseAll}
              className="px-2 py-1 text-xs text-muted-foreground hover:text-foreground font-semibold"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter permissions by keyword (e.g. edit, sizing, approve, delete)..."
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-muted border border-transparent focus:bg-background focus:border-ring outline-none text-xs"
        />
      </div>

      {/* Modules List */}
      <div className="space-y-3">
        {filteredModules.map((mod) => {
          const modPermIds = mod.permissions.map((p) => p.id);
          const selectedCount = modPermIds.filter((id) => selectedPermissions.includes(id)).length;
          const isModAllSelected = modPermIds.length > 0 && selectedCount === modPermIds.length;
          const isModPartial = selectedCount > 0 && !isModAllSelected;
          const isExpanded = Boolean(expandedModules[mod.id]);

          return (
            <div
              key={mod.id}
              className="rounded-2xl bg-card border border-border overflow-hidden transition-smooth"
            >
              {/* Module Header Bar */}
              <div
                className="flex items-center justify-between p-3.5 bg-muted/40 hover:bg-muted/60 transition-colors cursor-pointer select-none"
                onClick={() => toggleModuleExpand(mod.id)}
              >
                <div className="flex items-center gap-3">
                  {!readOnly && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleModule(mod.permissions);
                      }}
                      className="p-1 rounded hover:bg-background cursor-pointer"
                    >
                      {isModAllSelected ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : isModPartial ? (
                        <div className="h-4 w-4 rounded border-2 border-primary bg-primary/20 flex items-center justify-center">
                          <div className="h-1.5 w-1.5 bg-primary rounded-sm" />
                        </div>
                      ) : (
                        <Square className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{mod.name}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          selectedCount > 0
                            ? "bg-primary/15 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {selectedCount} / {mod.permissions.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">{mod.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </div>

              {/* Module Permissions Grid */}
              {isExpanded && (
                <div className="p-3.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 border-t border-border/50">
                  {mod.permissions.map((perm) => {
                    const isChecked = selectedPermissions.includes(perm.id);
                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                          readOnly
                            ? isChecked
                              ? "bg-primary/5 border-primary/20 text-foreground"
                              : "bg-muted/30 border-transparent text-muted-foreground opacity-50"
                            : isChecked
                            ? "bg-primary/10 border-primary/30 text-foreground shadow-sm cursor-pointer"
                            : "bg-muted/20 border-border hover:bg-muted/50 hover:border-primary/20 cursor-pointer"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          disabled={readOnly}
                          onChange={() => handleToggleSingle(perm.id)}
                          className="mt-0.5 h-4 w-4 rounded accent-primary cursor-pointer disabled:cursor-default"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-foreground leading-tight flex items-center justify-between">
                            <span>{perm.name}</span>
                            <span className="text-[9px] font-mono text-muted-foreground uppercase opacity-75">
                              {perm.id.split(".")[1]}
                            </span>
                          </div>
                          {/* <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
                            {perm.description}
                          </p> */}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {filteredModules.length === 0 && (
          <div className="p-8 text-center bg-card border border-border rounded-2xl text-muted-foreground">
            No permissions matching "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
