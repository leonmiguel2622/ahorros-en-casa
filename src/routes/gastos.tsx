import { createFileRoute } from "@tanstack/react-router";
import { FinanceApp } from "@/components/finance-app";
import { financeHead } from "@/lib/finance-meta";
export const Route = createFileRoute("/gastos")({
  head: () =>
    financeHead(
      "Gastos",
      "Organiza tus gastos de transporte, hogar y personales sin confundirlos con el ahorro.",
    ),
  component: () => <FinanceApp view="expense" />,
});
