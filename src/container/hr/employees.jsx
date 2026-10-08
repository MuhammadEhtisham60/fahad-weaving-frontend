import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/hr/employees")({
  component: () => <Outlet />,
});
