import { createFileRoute } from "@tanstack/react-router";
import { Building2, Bell, Shield, Users } from "lucide-react";
import { PageHeader, Card, Button, SectionTitle } from "../../components/ui-kit.jsx";

export const Route = createFileRoute("/settings/")({ component: SettingsPage });

const roles = [
  { name: "Admin", desc: "Full system access", count: 2 },
  { name: "Manager", desc: "Operations & approvals", count: 4 },
  { name: "HR", desc: "Employees & payroll", count: 2 },
  { name: "Accountant", desc: "Finance & reports", count: 3 },
  { name: "Store Manager", desc: "Inventory & purchasing", count: 2 },
  { name: "Employee", desc: "Self-service portal", count: 38 },
];

function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" subtitle="Company, roles, notifications and security" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <SectionTitle title="Company Profile" action={<Building2 className="h-4 w-4 text-muted-foreground" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ["Company Name", "Fahad Weaving"],
              ["Registration #", "REG-PK-2018-44231"],
              ["Address", "Plot 21, SITE Industrial Area, Karachi"],
              ["Phone", "+92 21 32556677"],
              ["Email", "info@fahadweaving.com"],
              ["Currency", "PKR — Pakistani Rupee"],
              ["Time Zone", "Asia/Karachi (UTC+5)"],
              ["Branches", "Karachi · Lahore · Faisalabad"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{k}</div>
                <div className="mt-1 px-3 py-2 rounded-lg bg-muted text-sm">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </Card>

        <Card>
          <SectionTitle title="Notifications" action={<Bell className="h-4 w-4 text-muted-foreground" />} />
          <div className="space-y-3">
            {["Late arrival alerts", "Low stock alerts", "Salary processed", "New purchase order", "New sales invoice", "Daily summary email"].map((n, i) => (
              <label key={n} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 cursor-pointer">
                <span className="text-sm">{n}</span>
                <input type="checkbox" defaultChecked={i !== 5} className="h-4 w-4 accent-[oklch(0.52_0.22_280)]" />
              </label>
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle title="Roles & Permissions" action={<Users className="h-4 w-4 text-muted-foreground" />} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {roles.map((r) => (
              <div key={r.name} className="p-4 rounded-xl border border-border hover:border-primary/40 transition-smooth">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.name}</div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-accent-foreground font-semibold">{r.count}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle title="Security" action={<Shield className="h-4 w-4 text-muted-foreground" />} />
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <span>Two-factor authentication</span>
              <span className="text-xs font-semibold text-success">Enabled</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <span>Audit logs</span>
              <span className="text-xs font-semibold text-success">On</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40">
              <span>Session timeout</span>
              <span className="text-xs text-muted-foreground">30 min</span>
            </div>
            <Button className="w-full mt-2" variant="outline">Manage Security</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
