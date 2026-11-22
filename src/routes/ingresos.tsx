import { createFileRoute } from "@tanstack/react-router";
import { FinanceApp } from "@/components/finance-app";
import { financeHead } from "@/lib/finance-meta";
export const Route = createFileRoute("/ingresos")({
  head: () =>
    financeHead(
      "Ingresos",
      "Registra y consulta tus ingresos reales, sueldo y bonificaciones en COP.",
    ),
  component: () => <FinanceApp view="income" />,
});
