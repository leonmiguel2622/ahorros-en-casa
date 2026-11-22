import { createFileRoute } from "@tanstack/react-router";
import { FinanceApp } from "@/components/finance-app";
import { financeHead } from "@/lib/finance-meta";
export const Route = createFileRoute("/ahorros")({
  head: () =>
    financeHead(
      "Ahorros",
      "Sigue tu meta mensual de ahorro, crea objetivos y consulta tus aportes acumulados.",
    ),
  component: () => <FinanceApp view="savings" />,
});
