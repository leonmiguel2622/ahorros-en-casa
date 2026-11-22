import { createFileRoute } from "@tanstack/react-router";
import { FinanceApp } from "@/components/finance-app";
import { financeHead } from "@/lib/finance-meta";
export const Route = createFileRoute("/")({
  head: () =>
    financeHead(
      "Resumen",
      "Administra tu sueldo, gastos, ahorro y compromisos personales en pesos colombianos.",
    ),
  component: () => <FinanceApp view="summary" />,
});
