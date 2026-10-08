import React from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/user-management/users/$userId")({
  component: UserLayout,
});

function UserLayout() {
  return <Outlet />;
}
