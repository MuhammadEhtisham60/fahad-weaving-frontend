import React, { useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import { Button } from "../../../../../components/ui-kit.jsx";
import { BEAM_STATUSES } from "../../utils/constants.js";
import {
  InputField,
  SelectField,
  TextareaField,
} from "../../../../../common/sharefield";

export function BeamFormModal({ item, preselectedSizing, sizingEntries = [], onSave, onClose }) {
  const isEdit = Boolean(item);

  const [selectedSizingId, setSelectedSizingId] = useState(
    item?.sizingId || preselectedSizing?.id || sizingEntries[0]?.id || ""
  );

  const selectedSizing = sizingEntries.find((s) => s.id === selectedSizingId);

  const [formData, setFormData] = useState({
    beamNo: item?.beamNo || "",
    beamCode: item?.beamCode || `BC-C40-${Math.floor(2000 + Math.random() * 1000)}`,
    date: item?.date || new Date().toISOString().slice(0, 10),
    weight: item?.weight !== undefined ? item.weight : 95,
    length: item?.length !== undefined ? item.length : 2500,
    width: item?.width || "68 Inch (172 CM)",
    ends: item?.ends !== undefined ? item.ends : 4800,
    sizingPickup: item?.sizingPickup || "9.8%",
    status: item?.status || "Ready for Loom",
    remarks: item?.remarks || "",
  });

  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedSizing) {
      setError("Please select a source sizing run.");
      return;
    }
    if (Number(formData.length) <= 0) {
      setError("Beam length (meters) must be greater than zero.");
      return;
    }
    if (Number(formData.ends) <= 0) {
      setError("Number of warp ends must be greater than zero.");
      return;
    }

    onSave({
      ...formData,
      sizingId: selectedSizing.id,
      sizingNo: selectedSizing.sizingNo,
      rawMaterialId: selectedSizing.rawMaterialId,
      yarnName: selectedSizing.yarnName,
      lotNo: selectedSizing.lotNo,
      weight: Number(formData.weight) || 0,
      length: Number(formData.length) || 0,
      ends: Number(formData.ends) || 0,
      currentLoomId: isEdit ? item.currentLoomId : null,
      currentLoomNo: isEdit ? item.currentLoomNo : null,
      installationDate: isEdit ? item.installationDate : null,
      removalDate: isEdit ? item.removalDate : null,
      producedMeters: isEdit ? item.producedMeters : 0,
      history: item?.history || [
        {
          id: `BH-${Date.now()}`,
          date: formData.date,
          loomNo: "—",
          action: "Created & Received from Sizing",
          status: formData.status,
          operator: "Store Keeper",
          remarks: formData.remarks || "Warp beam created.",
        },
      ],
    });
  };

  const sizingBatchOptions = sizingEntries.map((sz) => ({
    value: sz.id,
    label: `${sz.sizingNo} · ${sz.yarnName} (Batch: ${sz.lotNo}) — Sized at: ${sz.sizingUnit}`,
  }));

  const beamStatusOptions = BEAM_STATUSES.map((st) => ({ value: st, label: st }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card border border-border rounded-2xl shadow-2xl p-6 scrollbar-custom">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isEdit ? `Edit Warp Beam (${item.beamNo})` : "Add New Warp Beam"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Register a warp beam produced from sized yarn, ready for mounting on power looms
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
          <SelectField
            label="Source Sizing Batch"
            name="selectedSizingId"
            value={selectedSizingId}
            onChange={(e) => {
              setSelectedSizingId(e.target.value);
              setError("");
            }}
            options={sizingBatchOptions}
            disabled={isEdit}
            required
            searchable={false}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Beam Code / Identifier"
              name="beamCode"
              value={formData.beamCode}
              onChange={(e) => setFormData({ ...formData, beamCode: e.target.value })}
              placeholder="e.g. BC-C40-2500"
              required
              inputClassName="font-mono"
            />

            <InputField
              label="Beam Creation Date"
              name="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/30 border border-border">
            <InputField
              label="Total Ends"
              name="ends"
              type="number"
              min="100"
              value={formData.ends}
              onChange={(e) => setFormData({ ...formData, ends: e.target.value })}
              required
              inputClassName="font-semibold"
            />

            <InputField
              label="Warp Length (m)"
              name="length"
              type="number"
              min="10"
              suffix="m"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: e.target.value })}
              required
              inputClassName="font-semibold font-mono"
            />

            <InputField
              label="Beam Weight (kg)"
              name="weight"
              type="number"
              min="1"
              step="0.1"
              suffix="kg"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              required
              inputClassName="font-mono"
            />

            <InputField
              label="Sizing Pickup (%)"
              name="sizingPickup"
              value={formData.sizingPickup}
              onChange={(e) => setFormData({ ...formData, sizingPickup: e.target.value })}
              placeholder="e.g. 9.8%"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Warp Width"
              name="width"
              value={formData.width}
              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
              placeholder="e.g. 68 Inch (172 CM)"
              required
            />

            <SelectField
              label="Beam Status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              options={beamStatusOptions}
              required
              searchable={false}
            />
          </div>

          <TextareaField
            label="Quality Inspection & Remarks"
            name="remarks"
            value={formData.remarks}
            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
            rows={2}
            placeholder="e.g. Sized beam approved for high-speed rapier loom. Zero loose ends."
          />

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? "Update Beam" : "Save Warp Beam"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

