import { createFileRoute } from "@tanstack/react-router";
import { FinanceApp } from "@/components/finance-app";
import { financeHead } from "@/lib/finance-meta";
export const Route = createFileRoute("/configuracion")({
  head: () =>
    financeHead(
      "Configuración",
      "Actualiza tu sueldo y deducciones, descarga tus datos y restaura respaldos personales.",
    ),
  component: () => <FinanceApp view="settings" />,
});
