import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { History, ArrowLeft, RotateCcw } from "lucide-react";
import { PageHeader, Button } from "../../components/ui-kit.jsx";
import { useUserStore } from "../user-management/utils/userStore.js";
import { ActivityTimeline } from "../user-management/components/ActivityTimeline.jsx";

export const Route = createFileRoute("/activity-log/")({
  component: ActivityLogPage,
});

function ActivityLogPage() {
  const { activities, users } = useUserStore();

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Activity Log"
        subtitle="Comprehensive audit trail of system events, logins, security alerts, and administrative actions"
        actions={
          <Link to="/user-management">
            <Button variant="outline" size="sm" className="text-xs">
              User Management
            </Button>
          </Link>
        }
      />

      <ActivityTimeline activities={activities} users={users} />
    </div>
  );
}
