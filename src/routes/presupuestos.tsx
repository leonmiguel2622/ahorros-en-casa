import { createFileRoute } from "@tanstack/react-router";
import { FinanceApp } from "@/components/finance-app";
import { financeHead } from "@/lib/finance-meta";
export const Route = createFileRoute("/presupuestos")({
  head: () =>
    financeHead(
      "Presupuestos",
      "Distribuye tus ingresos entre transporte, ahorro, aporte en casa y dinero personal.",
    ),
  component: () => <FinanceApp view="budgets" />,
});
