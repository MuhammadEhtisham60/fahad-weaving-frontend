import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "./dashboard/index.jsx";

export const Route = createFileRoute("/")({ component: Dashboard });
