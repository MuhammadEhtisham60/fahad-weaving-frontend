import { createFileRoute } from "@tanstack/react-router";
import { Package, AlertTriangle, Plus, Download, Boxes, Truck } from "lucide-react";
import { PageHeader, Card, Button, StatCard, SectionTitle, fmt, pkr } from "../../components/ui-kit.jsx";
import { inventory } from "../../lib/mock-data.js";

export const Route = createFileRoute("/inventory/")({ component: InventoryPage });

function InventoryPage() {
  const totalValue = inventory.reduce((s, i) => s + i.stock * i.price, 0);
  const low = inventory.filter((i) => i.stock < i.min);

  return (
    <div>
      <PageHeader
        title="Inventory & Store"
        subtitle="Live stock levels, suppliers and movement"
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" /> Export</Button>
            <Button><Plus className="h-4 w-4" /> Add Item</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total SKUs" value={inventory.length} icon={Boxes} gradient="primary" />
        <StatCard label="Stock Value" value={pkr(totalValue)} icon={Package} gradient="success" />
        <StatCard label="Low Stock" value={low.length} icon={AlertTriangle} gradient="warning" />
        <StatCard label="Suppliers" value={new Set(inventory.map((i) => i.supplier).filter((s) => s !== "—")).size} icon={Truck} gradient="info" />
      </div>

      <Card padded={false}>
        <div className="p-5 border-b border-border flex items-center justify-between">
          <SectionTitle title="All Items" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Item</th>
                <th className="text-left px-5 py-3">Category</th>
                <th className="text-right px-5 py-3">Stock</th>
                <th className="text-right px-5 py-3">Min Level</th>
                <th className="text-right px-5 py-3">Unit Price</th>
                <th className="text-right px-5 py-3">Value</th>
                <th className="text-left px-5 py-3">Supplier</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((i) => {
                const isLow = i.stock < i.min;
                const pct = Math.min(100, (i.stock / (i.min * 2)) * 100);
                return (
                  <tr key={i.id} className="border-t border-border hover:bg-muted/30 transition-smooth">
                    <td className="px-5 py-3">
                      <div className="font-medium">{i.name}</div>
                      <div className="text-xs text-muted-foreground">{i.id}</div>
                    </td>
                    <td className="px-5 py-3">
                      <div>{i.category}</div>
                      <div className="text-xs text-muted-foreground">{i.sub}</div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="font-bold">{fmt(i.stock)} <span className="text-xs font-normal text-muted-foreground">{i.unit}</span></div>
                      <div className="mt-1 h-1.5 w-24 ml-auto bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${isLow ? "bg-destructive" : "bg-success"}`} style={{ width: pct + "%" }} />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right text-muted-foreground">{fmt(i.min)}</td>
                    <td className="px-5 py-3 text-right font-mono">{pkr(i.price)}</td>
                    <td className="px-5 py-3 text-right font-semibold">{pkr(i.stock * i.price)}</td>
                    <td className="px-5 py-3 text-muted-foreground">{i.supplier}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${isLow ? "bg-destructive/15 text-destructive border-destructive/30" : "bg-success/15 text-success border-success/30"}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {isLow ? "Low" : "In Stock"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
