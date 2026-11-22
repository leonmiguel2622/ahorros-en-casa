import { createFileRoute } from "@tanstack/react-router";
import { FinanceApp } from "@/components/finance-app";
import { financeHead } from "@/lib/finance-meta";
export const Route = createFileRoute("/movimientos")({
  head: () =>
    financeHead(
      "Movimientos",
      "Consulta, busca, filtra y edita tu historial de ingresos, gastos y aportes al ahorro.",
    ),
  component: () => <FinanceApp view="movements" />,
});
