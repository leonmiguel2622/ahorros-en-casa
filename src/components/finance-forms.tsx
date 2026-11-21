import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFinance } from "./finance-store";
import { expenseCategories, incomeCategories, localDate, movementSchema, goalSchema, type Movement, type Goal } from "@/lib/finance";

export function MovementForm({ initial, onClose }: { initial: Partial<Movement>; onClose: () => void }) {
  const { data, period, update } = useFinance();
  const type = initial.type ?? "expense";
  const [form, setForm] = useState({ type, description: initial.description ?? "", amount: initial.amount?.toString() ?? "", date: initial.date ?? (localDate().startsWith(period) ? localDate() : `${period}-01`), category: initial.category ?? (type === "income" ? "Salario" : type === "saving" ? "Ahorro" : "Transporte"), method: initial.method ?? "Transferencia", notes: initial.notes ?? "", goalId: initial.goalId ?? "" });
  const [error, setError] = useState("");
  const set = (key: keyof typeof form, value: string) => setForm(previous => ({ ...previous, [key]: value }));
  function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = movementSchema.safeParse({ ...form, amount: Number(form.amount), id: initial.id ?? crypto.randomUUID() });
    if (!parsed.success) { setError("Escribe una descripción, una fecha válida y una cantidad mayor que cero, sin centavos."); return; }
    const saved = update(previous => ({ ...previous, movements: initial.id ? previous.movements.map(m => m.id === initial.id ? parsed.data : m) : [...previous.movements, parsed.data] }));
    if (saved) { toast.success(initial.id ? "Movimiento actualizado" : "Movimiento registrado"); onClose(); }
  }
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="dialog-scroll"><DialogHeader><DialogTitle>{initial.id ? "Editar movimiento" : "Nuevo movimiento"}</DialogTitle><DialogDescription>{form.type === "saving" ? "Tu aporte aumenta el ahorro, no los gastos de consumo." : "Cada movimiento cuenta para tu balance del mes."}</DialogDescription></DialogHeader><form onSubmit={submit} className="space-y-4">
    {error && <p role="alert" className="form-error">{error}</p>}
    <div className="form-grid">
      <label className="form-field full">Tipo de movimiento<select className="field" value={form.type} onChange={e => { const next = e.target.value as Movement["type"]; setForm(previous => ({ ...previous, type: next, category: next === "income" ? "Salario" : next === "saving" ? "Ahorro" : "Transporte", goalId: "" })); }}><option value="expense">Gasto</option><option value="income">Ingreso</option><option value="saving">Aporte al ahorro</option></select></label>
      <label className="form-field full">Descripción<input autoFocus className="field" placeholder={form.type === "income" ? "Ej. Sueldo de noviembre" : form.type === "saving" ? "Ej. Aporte de mi quincena" : "Ej. Autobuses de hoy"} value={form.description} onChange={e => set("description",e.target.value)} maxLength={120} required /></label>
      <label className="form-field">Cantidad (COP)<input className="field" type="number" min="1" step="1" max="1000000000000" placeholder="0" value={form.amount} onChange={e => set("amount",e.target.value)} required /></label>
      <label className="form-field">Fecha<input className="field" type="date" value={form.date} onChange={e => set("date",e.target.value)} required /></label>
      {form.type !== "saving" ? <label className="form-field">Categoría<select className="field" value={form.category} onChange={e => set("category",e.target.value)}>{(form.type === "income" ? incomeCategories : expenseCategories).map(c => <option key={c}>{c}</option>)}</select></label> : <label className="form-field">Objetivo<select className="field" value={form.goalId} onChange={e => set("goalId",e.target.value)}><option value="">Ahorro general</option>{data.goals.map(goal => <option key={goal.id} value={goal.id}>{goal.name}</option>)}</select></label>}
      <label className="form-field">{form.type === "income" ? "Método de recepción" : "Método de pago"}<select className="field" value={form.method} onChange={e => set("method",e.target.value)}>{["Transferencia", "Efectivo", "Tarjeta débito", "Tarjeta crédito", "Otro"].map(method => <option key={method}>{method}</option>)}</select></label>
      <label className="form-field full">Notas <span className="form-hint">Opcional</span><textarea className="field" maxLength={1000} placeholder="Un detalle que quieras recordar…" value={form.notes} onChange={e => set("notes",e.target.value)} /></label>
      {form.type === "income" && <p className="form-hint col-span-2">Registra el dinero realmente recibido. Si registras el salario neto con el auxilio incluido, no vuelvas a registrar el auxilio.</p>}
    </div><div className="form-actions"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit">{initial.id ? "Guardar cambios" : "Registrar movimiento"}</Button></div>
  </form></DialogContent></Dialog>;
}

export function GoalForm({ initial, onClose }: { initial?: Goal; onClose: () => void }) {
  const { update } = useFinance();
  const [error,setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const parsed = goalSchema.safeParse({ id: initial?.id ?? crypto.randomUUID(), name: fields.get("name"), target: Number(fields.get("target")), deadline: fields.get("deadline"), description: fields.get("description") });
    if (!parsed.success) { setError("Revisa el nombre, la fecha y la cantidad de tu objetivo."); return; }
    if (update(data => ({ ...data, goals: initial ? data.goals.map(g => g.id === initial.id ? parsed.data : g) : [...data.goals,parsed.data] }))) { toast.success("Objetivo guardado"); onClose(); }
  }
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}><DialogContent className="dialog-scroll"><DialogHeader><DialogTitle>{initial ? "Editar objetivo" : "Nuevo objetivo de ahorro"}</DialogTitle><DialogDescription>Algo que vale la pena construir, un aporte a la vez.</DialogDescription></DialogHeader><form onSubmit={submit}><div className="form-grid">{error && <p role="alert" className="form-error col-span-2">{error}</p>}<label className="form-field full">Nombre<input className="field" name="name" placeholder="Ej. Fondo de emergencia" maxLength={80} defaultValue={initial?.name} required /></label><label className="form-field">Meta (COP)<input className="field" type="number" name="target" min="1" step="1" max="1000000000000" defaultValue={initial?.target} required /></label><label className="form-field">Fecha límite (opcional)<input className="field" name="deadline" type="date" defaultValue={initial?.deadline} /></label><label className="form-field full">Descripción<textarea className="field" name="description" maxLength={500} defaultValue={initial?.description} /></label></div><div className="form-actions"><Button type="button" variant="outline" onClick={onClose}>Cancelar</Button><Button type="submit">Guardar objetivo</Button></div></form></DialogContent></Dialog>;
}