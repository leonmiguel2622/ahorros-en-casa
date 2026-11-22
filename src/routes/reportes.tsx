import { createFileRoute } from "@tanstack/react-router";
import { FinanceApp } from "@/components/finance-app";
import { financeHead } from "@/lib/finance-meta";
export const Route = createFileRoute("/reportes")({
  head: () =>
    financeHead(
      "Reportes",
      "Compara tus ingresos y gastos, analiza categorías y revisa la evolución de tu ahorro.",
    ),
  component: () => <FinanceApp view="reports" />,
});
