import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Download } from "lucide-react";
import { PageHeader, Button } from "../../components/ui-kit.jsx";
import { initialPurchases } from "./utils/constants.js";
import { pageContent } from "./utils/content.js";
import { nextPoId, paidForStatus, computePurchaseStats } from "./utils/helpers.js";
import { PurchaseStats } from "./components/PurchaseStats.jsx";
import { PurchaseTable } from "./table/PurchaseTable.jsx";
import { AddEditPurchase } from "./form/AddEditPurchase.jsx";
import { PurchaseDetail } from "./detail/PurchaseDetail.jsx";

export const Route = createFileRoute("/purchase/")({ component: PurchasesPage });

function PurchasesPage() {
  const [rows, setRows] = useState(initialPurchases);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const { total, paidSum, outstanding, pendingCount } = computePurchaseStats(rows);

  const updateStatus = (id, status) => {
    setRows((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const paid = paidForStatus(status, p.total, p.paid);
        const updated = { ...p, status, paid };
        if (selected?.id === id) setSelected(updated);
        return updated;
      })
    );
  };

  const addPurchase = (entry) => {
    const created = { id: nextPoId(rows), ...entry };
    setRows((prev) => [created, ...prev]);
    setSelected(created);
  };

  const handleSelect = (row) => setSelected(row);

  return (
    <div>
      <PageHeader
        title={pageContent.title}
        subtitle={pageContent.subtitle}
        actions={
          <>
            <Button variant="outline">
              <Download className="h-4 w-4" /> {pageContent.exportButton}
            </Button>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" /> {pageContent.newButton}
            </Button>
          </>
        }
      />

      <PurchaseStats total={total} paidSum={paidSum} outstanding={outstanding} pendingCount={pendingCount} />

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_minmax(280px,320px)] gap-6">
        <PurchaseTable rows={rows} onUpdateStatus={updateStatus} onSelect={handleSelect} />
        <PurchaseDetail purchase={selected} onClose={() => setSelected(null)} />
      </div>

      {modalOpen && <AddEditPurchase onClose={() => setModalOpen(false)} onSave={addPurchase} />}
    </div>
  );
}
