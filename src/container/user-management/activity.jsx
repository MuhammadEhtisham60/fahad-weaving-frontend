import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { History, ArrowLeft } from "lucide-react";
import { PageHeader } from "../../components/ui-kit.jsx";
import { useUserStore } from "./utils/userStore.js";
import { ActivityTimeline } from "./components/ActivityTimeline.jsx";

export const Route = createFileRoute("/user-management/activity")({
  component: UserActivityPage,
});

function UserActivityPage() {
  const { activities, users } = useUserStore();

  return (
    <div className="space-y-6 pb-12">
      <div>
        <Link
          to="/user-management"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to User Management
        </Link>
        <PageHeader
          title="User Activity & Security Logs"
          subtitle="Audit trail of logins, credential updates, role assignments, and user status events"
        />
      </div>

      <ActivityTimeline activities={activities} users={users} />
    </div>
  );
}
