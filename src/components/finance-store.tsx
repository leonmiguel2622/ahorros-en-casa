import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { DEFAULT_DATA, dataSchema, localDate, type FinanceData } from "@/lib/finance";

const KEY = "mis-finanzas-v1";
type Store = { data: FinanceData; ready: boolean; period: string; setPeriod: (value: string) => void; update: (updater: (data: FinanceData) => FinanceData, recover?: boolean) => boolean; storageError: string };
const FinanceContext = createContext<Store | null>(null);
export function FinanceProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<FinanceData>(DEFAULT_DATA);
  const [ready, setReady] = useState(false);
  const [period, setPeriod] = useState("2026-11");
  const [storageError, setStorageError] = useState("");
  useEffect(() => {
    setPeriod(localDate().slice(0,7));
    try { const raw = localStorage.getItem(KEY); if (raw) { const parsed = dataSchema.safeParse(JSON.parse(raw)); if (parsed.success) setData(parsed.data); else setStorageError("El respaldo local no es válido. No se ha sobrescrito; importa un respaldo válido en Configuración."); } }
    catch { setStorageError("No pudimos leer tus datos locales. No se han sobrescrito. Revisa el almacenamiento del navegador."); }
    setReady(true);
  }, []);
  const update = (updater: (data: FinanceData) => FinanceData, recover = false) => {
    if (!ready || (storageError && !recover)) { toast.error("Resuelve el problema de almacenamiento antes de guardar."); return false; }
    const parsed = dataSchema.safeParse(updater(data));
    if (!parsed.success) { toast.error("Los datos no son válidos. Revisa las cantidades y las fechas."); return false; }
    try { localStorage.setItem(KEY, JSON.stringify(parsed.data)); setData(parsed.data); setStorageError(""); return true; }
    catch { toast.error("No se pudo guardar. El almacenamiento puede estar lleno o deshabilitado."); return false; }
  };
  return <FinanceContext.Provider value={{ data, ready, period, setPeriod, update, storageError }}>{children}</FinanceContext.Provider>;
}
export function useFinance() { const value = useContext(FinanceContext); if (!value) throw new Error("FinanceProvider required"); return value; }