import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "../../../../../components/ui-kit.jsx";
import { LOOM_TYPES, LOOM_STATUSES, DEPARTMENTS } from "../../utils/constants.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../../common/sharefield";

export function LoomFormModal({ item, onSave, onClose }) {
  const isEdit = Boolean(item);

  const [formData, setFormData] = useState({
    loomNo: item?.loomNo || "",
    name: item?.name || "Picanol OptiMax-i 190",
    type: item?.type || LOOM_TYPES[0],
    manufacturer: item?.manufacturer || "Picanol (Belgium)",
    model: item?.model || "OptiMax-i 2024",
    serialNo: item?.serialNo || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
    installationDate: item?.installationDate || new Date().toISOString().slice(0, 10),
    location: item?.location || "Weaving Shed 1 - Bay 01",
    department: item?.department || DEPARTMENTS[0],
    width: item?.width || "190 CM (75 Inch)",
    rpm: item?.rpm !== undefined ? item.rpm : 550,
    efficiency: item?.efficiency || "92.0%",
    status: item?.status || "Idle",
    operator: item?.operator || "Ahmad Khan (Supervisor)",
    notes: item?.notes || "",
  });

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Loom name is required.");
      return;
    }
    if (!formData.location.trim()) {
      setError("Location / Shed bay is required.");
      return;
    }

    onSave({
      ...formData,
      rpm: Number(formData.rpm) || 0,
      currentBeamId: isEdit ? item.currentBeamId : null,
      currentBeamNo: isEdit ? item.currentBeamNo : null,
      beamHistory: item?.beamHistory || [],
    });
  };

  const loomTypeOptions = LOOM_TYPES.map((lt) => ({ value: lt, label: lt }));
  const departmentOptions = DEPARTMENTS.map((dept) => ({ value: dept, label: dept }));
  const loomStatusOptions = LOOM_STATUSES.map((ls) => ({ value: ls, label: ls }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 scrollbar-custom">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isEdit ? `Edit Loom (${item.loomNo})` : "Add Weaving Loom"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Register a power loom machine with specifications, shed location, and operator
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Loom Name / Description"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Picanol OptiMax-i 190"
              required
            />

            <SelectField
              label="Loom Type"
              name="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={loomTypeOptions}
              required
              searchable={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <InputField
              label="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
              placeholder="e.g. Picanol, Toyota, Tsudakoma"
              required
            />

            <InputField
              label="Model Name / Series"
              name="model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="e.g. OptiMax-i 2024"
            />

            <InputField
              label="Serial Number"
              name="serialNo"
              value={formData.serialNo}
              onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
              placeholder="e.g. SN-PIC-88910"
              inputClassName="font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField
              label="Department / Weaving Shed"
              name="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              options={departmentOptions}
              required
              searchable={false}
            />

            <InputField
              label="Physical Location / Bay"
              name="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Weaving Shed 1 - Bay 01"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
            <InputField
              label="Reed Width"
              name="width"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              placeholder="e.g. 190 CM (75 Inch)"
              required
              inputClassName="font-semibold"
            />

            <InputField
              label="Speed (RPM)"
              name="rpm"
              type="number"
              min="50"
              suffix="RPM"
              value={formData.rpm}
              onChange={(e) => setFormData({ ...formData, rpm: e.target.value })}
              required
              inputClassName="font-semibold font-mono"
            />

            <SelectField
              label="Loom Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={loomStatusOptions}
              required
              searchable={false}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Floor Operator / Supervisor"
              name="operator"
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              placeholder="e.g. Ahmad Khan"
            />

            <InputField
              label="Installation Date"
              name="installationDate"
              type="date"
              value={formData.installationDate}
              onChange={(e) => setFormData({ ...formData, installationDate: e.target.value })}
            />
          </div>

          <TextareaField
            label="Maintenance Notes / Calibration"
            name="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
            placeholder="e.g. Electronic let-off and warp tension calibrated. Ready for cotton runs."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Loom" : "Save Loom Machine"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

