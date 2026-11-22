import { useRef, useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeftRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  Bus,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Download,
  Ellipsis,
  House,
  LayoutDashboard,
  Leaf,
  Menu,
  Pencil,
  PiggyBank,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Upload,
  Wallet,
  X,
  ChartNoAxesCombined,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFinance } from "./finance-store";
import { MovementForm, GoalForm } from "./finance-forms";
import { BudgetChart, ComparisonChart, ProgressBar } from "./finance-charts";
import {
  categories,
  budgetSchema,
  dataSchema,
  expenseCategories,
  incomeCategories,
  money,
  monthLabel,
  movementCategory,
  netSalary,
  progress,
  salarySchema,
  shiftMonth,
  summarize,
  type Movement,
  type Budget,
  type Goal,
} from "@/lib/finance";

export type View =
  "summary" | "income" | "expense" | "movements" | "budgets" | "savings" | "settings" | "reports";
const navigation = [
  { view: "summary", title: "Resumen", path: "/", icon: LayoutDashboard },
  { view: "income", title: "Ingresos", path: "/ingresos", icon: ArrowDownLeft },
  { view: "expense", title: "Gastos", path: "/gastos", icon: ArrowUpRight },
  { view: "movements", title: "Movimientos", path: "/movimientos", icon: ArrowLeftRight },
  { view: "budgets", title: "Presupuestos", path: "/presupuestos", icon: Wallet },
  { view: "savings", title: "Ahorros", path: "/ahorros", icon: PiggyBank },
  { view: "reports", title: "Reportes", path: "/reportes", icon: ChartNoAxesCombined },
] as const;
const icons: Record<keyof Budget, LucideIcon> = {
  transport: Bus,
  savings: PiggyBank,
  home: House,
  personal: Sparkles,
};
const typeNames = { income: "Ingreso", expense: "Gasto", saving: "Ahorro" };

function Stat({
  label,
  value,
  foot,
  icon: Icon,
  salary = false,
}: {
  label: string;
  value: number;
  foot: string;
  icon: LucideIcon;
  salary?: boolean;
}) {
  return (
    <article className={`stat-card ${salary ? "salary" : ""}`}>
      <div className="stat-label">
        <span>{label}</span>
        <span className="small-icon">
          <Icon size={15} />
        </span>
      </div>
      <div className="stat-value">{money(value)}</div>
      <div className="stat-foot">
        {salary ? <ShieldCheck size={12} /> : <span className="size-1 rounded-full bg-border" />}
        {foot}
      </div>
    </article>
  );
}

function BudgetCards() {
  const { data, period } = useFinance();
  const summary = summarize(data, period);
  return (
    <div className="budget-grid">
      {categories.map((c) => {
        const Icon = icons[c.key];
        const used = summary.used[c.key];
        const target = summary.budget[c.key];
        const percent = progress(used, target);
        const remaining = target - used;
        return (
          <article className={`budget-card ${c.key}`} key={c.key}>
            <div className="budget-top">
              <span className="category-icon">
                <Icon size={17} />
              </span>
              {c.name}
            </div>
            <div className="budget-value">{money(target)}</div>
            <div className="budget-unit">{c.hint}</div>
            <ProgressBar value={used} target={target} />
            <div className="budget-detail">
              <span>
                {c.key === "savings" ? "Ahorrado" : "Utilizado"} <strong>{money(used)}</strong>
              </span>
              <span>{Math.round(percent)}%</span>
            </div>
            <div className="budget-status">
              {remaining < 0 ? (
                <ArrowUpRight size={12} />
              ) : used >= target && target > 0 ? (
                <Check size={12} />
              ) : (
                <span className="size-1 rounded-full bg-border" />
              )}
              {remaining < 0
                ? `Excedido en ${money(-remaining)}`
                : c.key === "savings" || c.key === "home"
                  ? remaining === 0
                    ? "Compromiso cumplido"
                    : `Pendiente: ${money(remaining)}`
                  : percent >= 90
                    ? `Cerca del límite · ${money(remaining)} restantes`
                    : `Disponible: ${money(remaining)}`}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MovementsTable({
  rows,
  onEdit,
  onDelete,
  emptyAction,
}: {
  rows: Movement[];
  onEdit: (movement: Movement) => void;
  onDelete: (movement: Movement) => void;
  emptyAction: () => void;
}) {
  return rows.length ? (
    <table className="movement-table">
      <thead>
        <tr>
          <th>Descripción</th>
          <th className="hide-mobile">Fecha</th>
          <th className="hide-mobile">Tipo</th>
          <th>Cantidad</th>
          <th>
            <span className="sr-only">Acciones</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((m) => {
          const key = movementCategory(m);
          const Icon = m.type === "income" ? ArrowDownLeft : icons[key];
          return (
            <tr key={m.id}>
              <td>
                <div className="movement-title">
                  <span className={`category-icon ${m.type === "income" ? "savings" : key}`}>
                    <Icon size={16} />
                  </span>
                  <span>
                    {m.description}
                    <span className="movement-category">
                      {m.category}
                      {m.type === "saving" ? " · Transferencia interna" : ""}
                    </span>
                  </span>
                </div>
              </td>
              <td className="hide-mobile">
                {new Date(`${m.date}T12:00:00`).toLocaleDateString("es-CO", {
                  day: "2-digit",
                  month: "short",
                })}
              </td>
              <td className="hide-mobile">
                <span className={`type-pill ${m.type}`}>{typeNames[m.type]}</span>
              </td>
              <td className={`movement-amount ${m.type === "income" ? "text-primary" : ""}`}>
                {m.type === "income" ? "+" : "−"}
                {money(m.amount)}
              </td>
              <td>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar ${m.description}`}
                    title="Editar movimiento"
                    onClick={() => onEdit(m)}
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar ${m.description}`}
                    title="Eliminar movimiento"
                    onClick={() => onDelete(m)}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  ) : (
    <div className="empty-state">
      <ArrowLeftRight size={26} />
      <h3>Tus movimientos aparecerán aquí</h3>
      <p>Aún no hay registros que coincidan con este periodo.</p>
      <Button variant="outline" size="sm" onClick={emptyAction}>
        <Plus />
        Registrar movimiento
      </Button>
    </div>
  );
}

function MovementFilters({
  view,
  onEdit,
  onDelete,
  onNew,
}: {
  view: View;
  onEdit: (m: Movement) => void;
  onDelete: (m: Movement) => void;
  onNew: () => void;
}) {
  const { data, period } = useFinance();
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [category, setCategory] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const rows = summarize(data, period)
    .movements.filter(
      (m) =>
        (view !== "income" || m.type === "income") &&
        (view !== "expense" || m.type === "expense") &&
        (!type || m.type === type) &&
        (!category || m.category === category) &&
        m.description.toLocaleLowerCase("es").includes(search.toLocaleLowerCase("es")) &&
        (!from || m.date >= from) &&
        (!to || m.date <= to),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
  return (
    <section className="movement-section">
      <div className="filters">
        <div className="search-field">
          <Search size={15} />
          <input
            className="field"
            aria-label="Buscar movimientos"
            placeholder="Buscar por descripción…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {view === "movements" && (
          <select
            className="field"
            aria-label="Filtrar por tipo"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            <option value="income">Ingresos</option>
            <option value="expense">Gastos</option>
            <option value="saving">Ahorros</option>
          </select>
        )}
        <select
          className="field"
          aria-label="Filtrar por categoría"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {Array.from(new Set([...incomeCategories, ...expenseCategories, "Ahorro"])).map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <input
          className="field"
          type="date"
          aria-label="Desde"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
        <input
          className="field"
          type="date"
          aria-label="Hasta"
          value={to}
          onChange={(e) => setTo(e.target.value)}
        />
        {(search || type || category || from || to) && (
          <Button
            variant="ghost"
            size="icon"
            title="Limpiar filtros"
            aria-label="Limpiar filtros"
            onClick={() => {
              setSearch("");
              setType("");
              setCategory("");
              setFrom("");
              setTo("");
            }}
          >
            <X />
          </Button>
        )}
      </div>
      <div className="movement-head">
        <h2>
          {view === "income"
            ? "Ingresos registrados"
            : view === "expense"
              ? "Gastos registrados"
              : "Todos los movimientos"}
        </h2>
        <span className="text-xs text-muted-foreground">{rows.length} registros</span>
      </div>
      <MovementsTable rows={rows} onEdit={onEdit} onDelete={onDelete} emptyAction={onNew} />
    </section>
  );
}

function BudgetSettings() {
  const { data, period, update } = useFinance();
  const summary = summarize(data, period);
  const [error, setError] = useState("");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = budgetSchema.safeParse(
      Object.fromEntries(categories.map((c) => [c.key, Number(form.get(c.key))])),
    );
    if (!parsed.success) {
      setError("Los presupuestos deben ser cantidades válidas, en pesos enteros y no negativas.");
      return;
    }
    if (
      update((previous) => ({
        ...previous,
        budgets: { ...previous.budgets, [period]: parsed.data },
      }))
    ) {
      setError("");
      toast.success("Presupuestos del mes actualizados");
    }
  }
  return (
    <>
      <BudgetCards />
      <section className="panel settings-panel mt-6">
        <div className="settings-section">
          <h2>Tu distribución mensual</h2>
          <p>
            Presupuestos de {monthLabel(period)}. Los cambios no modifican tus movimientos ni otros
            periodos.
          </p>
          <form onSubmit={submit} key={period}>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="form-grid">
              {categories.map((c) => (
                <label className="form-field" key={c.key}>
                  {c.name} (COP)
                  <input
                    className="field"
                    type="number"
                    min="0"
                    step="1"
                    max="1000000000000"
                    name={c.key}
                    defaultValue={summary.budget[c.key]}
                    required
                  />
                </label>
              ))}
            </div>
            <div className="salary-breakdown">
              <span>Total asignado actualmente</span>
              <strong>{money(Object.values(summary.budget).reduce((a, b) => a + b, 0))}</strong>
            </div>
            {Object.values(summary.budget).reduce((a, b) => a + b, 0) > summary.expected && (
              <p className="form-error mt-4">Tus presupuestos superan el ingreso neto estimado.</p>
            )}
            <div className="form-actions">
              <Button type="submit">Guardar presupuestos</Button>
            </div>
          </form>
        </div>
        <div className="settings-section">
          <h2>Tu recorrido de transporte</h2>
          <p>
            Ida: {money(3000)} + {money(2500)} · Regreso: {money(2500)} + {money(3000)}
            <br />
            Total diario: <strong>{money(11000)}</strong> · 5 días laborables por semana
          </p>
        </div>
      </section>
    </>
  );
}

function SavingsView({
  onNew,
  onGoal,
  onEditGoal,
  onDeleteGoal,
}: {
  onNew: (initial: Partial<Movement>) => void;
  onGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
}) {
  const { data, period } = useFinance();
  const s = summarize(data, period);
  return (
    <>
      <div className="stats-grid">
        <Stat
          label="Ahorro acumulado"
          value={s.accumulated}
          foot="Todos tus aportes, de todos los meses"
          icon={PiggyBank}
          salary
        />
        <Stat
          label="Ahorrado este mes"
          value={s.used.savings}
          foot={`${Math.round(progress(s.used.savings, s.budget.savings))}% de tu meta mensual`}
          icon={TrendingUp}
        />
        <Stat
          label="Meta mensual"
          value={s.budget.savings}
          foot="Tu compromiso contigo mismo"
          icon={Target}
        />
        <Stat
          label="Falta para tu meta"
          value={Math.max(0, s.budget.savings - s.used.savings)}
          foot={
            s.used.savings >= s.budget.savings ? "¡Meta del mes cumplida!" : "Un aporte a la vez"
          }
          icon={Wallet}
        />
      </div>
      <div className="section-heading">
        <h2>Mis objetivos de ahorro</h2>
        <Button variant="outline" size="sm" onClick={onGoal}>
          <Plus />
          Nuevo objetivo
        </Button>
      </div>
      <div className="goals-grid">
        <article className="goal-card savings">
          <div className="flex items-center justify-between">
            <span className="category-icon">
              <PiggyBank size={21} />
            </span>
            <span className="panel-tag">Mensual</span>
          </div>
          <h3>Ahorro del mes</h3>
          <p>{monthLabel(period)} · Tu meta principal</p>
          <div className="budget-value">{money(s.used.savings)}</div>
          <ProgressBar value={s.used.savings} target={s.budget.savings} />
          <div className="budget-detail">
            <span>de {money(s.budget.savings)}</span>
            <strong>{Math.round(progress(s.used.savings, s.budget.savings))}%</strong>
          </div>
          <Button className="mt-5 w-full" onClick={() => onNew({ type: "saving" })}>
            <Plus />
            Registrar aporte
          </Button>
        </article>
        {data.goals.map((goal) => {
          const amount = data.movements
            .filter((m) => m.type === "saving" && m.goalId === goal.id)
            .reduce((a, m) => a + m.amount, 0);
          return (
            <article className="goal-card transport" key={goal.id}>
              <div className="flex items-center justify-between">
                <span className="category-icon">
                  <Target size={21} />
                </span>
                <div className="flex">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Editar objetivo ${goal.name}`}
                    title="Editar objetivo"
                    onClick={() => onEditGoal(goal)}
                  >
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Eliminar objetivo ${goal.name}`}
                    title="Eliminar objetivo"
                    onClick={() => onDeleteGoal(goal)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </div>
              <h3>{goal.name}</h3>
              <p>
                {goal.description || "Tu próximo propósito financiero"}
                {goal.deadline &&
                  ` · Hasta ${new Date(`${goal.deadline}T12:00:00`).toLocaleDateString("es-CO")}`}
              </p>
              <div className="budget-value">{money(amount)}</div>
              <ProgressBar value={amount} target={goal.target} />
              <div className="budget-detail">
                <span>de {money(goal.target)}</span>
                <strong>{Math.round(progress(amount, goal.target))}%</strong>
              </div>
              <p>Faltan {money(Math.max(0, goal.target - amount))}</p>
              <Button
                variant="outline"
                className="mt-2 w-full"
                onClick={() => onNew({ type: "saving", goalId: goal.id })}
              >
                <Plus />
                Aportar a este objetivo
              </Button>
            </article>
          );
        })}
      </div>
      <div className="analysis-grid">
        <ComparisonChart data={data} period={period} savingOnly />
        <section className="panel">
          <div className="panel-head">
            <h2>Historial de aportes</h2>
          </div>
          {s.movements.filter((m) => m.type === "saving").length ? (
            <div className="p-5 space-y-4">
              {s.movements
                .filter((m) => m.type === "saving")
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((m) => (
                  <div className="flex justify-between gap-3 text-xs" key={m.id}>
                    <span>
                      {m.description}
                      <small className="block mt-1 text-muted-foreground">{m.date}</small>
                    </span>
                    <strong>{money(m.amount)}</strong>
                  </div>
                ))}
            </div>
          ) : (
            <div className="empty-state">
              <PiggyBank size={25} />
              <h3>Tu primer aporte es el comienzo</h3>
              <p>Todavía no has registrado ahorros este mes.</p>
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function SettingsView() {
  const { data, update } = useFinance();
  const fileRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [pendingImport, setPendingImport] = useState<ReturnType<typeof dataSchema.parse> | null>(
    null,
  );
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const parsed = salarySchema.safeParse(
      Object.fromEntries(
        ["base", "transport", "health", "pension"].map((key) => [key, Number(fields.get(key))]),
      ),
    );
    if (!parsed.success) {
      setError("Revisa las cantidades y los porcentajes (entre 0 y 100).");
      return;
    }
    if (update((previous) => ({ ...previous, salary: parsed.data }))) {
      setError("");
      toast.success("Configuración del sueldo guardada");
    }
  }
  function download() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mis-finanzas-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Respaldo descargado");
  }
  return (
    <section className="panel settings-panel">
      <div className="settings-section">
        <h2>Tu sueldo y deducciones</h2>
        <p>El auxilio de transporte no se incluye en la base de salud y pensión.</p>
        <form onSubmit={submit}>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <div className="form-grid">
            <label className="form-field">
              Salario base bruto (COP)
              <input
                className="field"
                name="base"
                type="number"
                min="0"
                step="1"
                max="1000000000000"
                defaultValue={data.salary.base}
                required
              />
            </label>
            <label className="form-field">
              Auxilio de transporte (COP)
              <input
                className="field"
                name="transport"
                type="number"
                min="0"
                step="1"
                max="1000000000000"
                defaultValue={data.salary.transport}
                required
              />
            </label>
            <label className="form-field">
              Salud (%)
              <input
                className="field"
                name="health"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={data.salary.health}
                required
              />
              <span className="form-hint">
                Deducción: {money(Math.round((data.salary.base * data.salary.health) / 100))}
              </span>
            </label>
            <label className="form-field">
              Pensión (%)
              <input
                className="field"
                name="pension"
                type="number"
                min="0"
                max="100"
                step="0.01"
                defaultValue={data.salary.pension}
                required
              />
              <span className="form-hint">
                Deducción: {money(Math.round((data.salary.base * data.salary.pension) / 100))}
              </span>
            </label>
          </div>
          <div className="salary-breakdown">
            <span>Ingreso neto mensual estimado</span>
            <strong>{money(netSalary(data.salary))}</strong>
          </div>
          <div className="form-actions">
            <Button type="submit">Guardar configuración</Button>
          </div>
        </form>
      </div>
      <div className="settings-section">
        <h2>Respaldo de tus finanzas</h2>
        <p>
          Tus datos se guardan en este navegador y dispositivo. Descarga un respaldo antes de borrar
          los datos del navegador o cambiar de equipo.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={download}>
            <Download />
            Descargar respaldo
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload />
            Importar respaldo
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Importar archivo de respaldo"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                if (file.size > 15000000) throw new Error("too large");
                const parsed = dataSchema.safeParse(JSON.parse(await file.text()));
                if (!parsed.success) throw new Error("invalid");
                setPendingImport(parsed.data);
              } catch {
                toast.error("El archivo no es un respaldo válido de Mis Finanzas.");
              }
              e.target.value = "";
            }}
          />
        </div>
      </div>
      <div className="settings-section">
        <h2>Acerca de Mis Finanzas</h2>
        <p>
          Moneda: peso colombiano (COP). Las deducciones se redondean a pesos enteros. El sueldo
          estimado es una referencia; el dinero disponible se calcula a partir de los ingresos que
          registras, los gastos, los ahorros y los compromisos pendientes.
        </p>
      </div>
      {pendingImport && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setPendingImport(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Restaurar este respaldo?</DialogTitle>
              <DialogDescription>
                Reemplazará todos los datos actuales con {pendingImport.movements.length}{" "}
                movimientos y {pendingImport.goals.length} objetivos. Descarga primero tu respaldo
                actual si deseas conservarlo.
              </DialogDescription>
            </DialogHeader>
            <div className="form-actions">
              <Button variant="outline" onClick={() => setPendingImport(null)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  if (update(() => pendingImport, true)) {
                    setPendingImport(null);
                    toast.success("Respaldo restaurado");
                  }
                }}
              >
                Restaurar respaldo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}

function ReportsView() {
  const { data, period } = useFinance();
  const s = summarize(data, period);
  const expenseGroups = expenseCategories
    .map((category) => ({
      category,
      total: s.movements
        .filter((m) => m.type === "expense" && m.category === category)
        .reduce((a, m) => a + m.amount, 0),
    }))
    .filter((g) => g.total > 0);
  return (
    <>
      <div className="analysis-grid mt-0">
        <ComparisonChart data={data} period={period} />
        <ComparisonChart data={data} period={period} savingOnly />
        <BudgetChart budget={s.budget} />
        <section className="panel">
          <div className="panel-head">
            <h2>Gastos por categoría</h2>
            <span className="panel-tag">{money(s.expenses)}</span>
          </div>
          {expenseGroups.length ? (
            <div className="p-6 space-y-5 personal">
              {expenseGroups.map((g) => (
                <div key={g.category}>
                  <div className="flex justify-between text-xs mb-2">
                    <span>{g.category}</span>
                    <strong>{money(g.total)}</strong>
                  </div>
                  <ProgressBar value={g.total} target={s.expenses} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Wallet size={25} />
              <h3>Sin gastos registrados</h3>
              <p>El gasto de cada categoría aparecerá cuando lo registres.</p>
            </div>
          )}
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Transporte por semana</h2>
          </div>
          <div className="p-6 space-y-5 transport">
            {Array.from({ length: 5 }, (_, i) => {
              const total = s.movements
                .filter(
                  (m) =>
                    m.type === "expense" &&
                    m.category === "Transporte" &&
                    Math.floor((Number(m.date.slice(-2)) - 1) / 7) === i,
                )
                .reduce((a, m) => a + m.amount, 0);
              return (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-2">
                    <span>
                      Días {i * 7 + 1}–
                      {Math.min(
                        i * 7 + 7,
                        new Date(Number(period.slice(0, 4)), Number(period.slice(5)), 0).getDate(),
                      )}
                    </span>
                    <strong>{money(total)}</strong>
                  </div>
                  <ProgressBar value={total} target={s.budget.transport} />
                </div>
              );
            })}
          </div>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>Cumplimiento de presupuestos</h2>
          </div>
          <div className="p-6 space-y-5">
            {categories.map((c) => (
              <div className={c.key} key={c.key}>
                <div className="flex justify-between text-xs mb-2">
                  <span>{c.name}</span>
                  <strong>{Math.round(progress(s.used[c.key], s.budget[c.key]))}%</strong>
                </div>
                <ProgressBar value={s.used[c.key]} target={s.budget[c.key]} />
                <p className="form-hint mt-1">
                  {money(s.used[c.key])} de {money(s.budget[c.key])}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}

export function FinanceApp({ view }: { view: View }) {
  const { data, period, setPeriod, update, ready, storageError } = useFinance();
  const s = summarize(data, period);
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState<Partial<Movement> | null>(null);
  const [goalForm, setGoalForm] = useState<Goal | "new" | null>(null);
  const [deleting, setDeleting] = useState<Movement | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<Goal | null>(null);
  const [help, setHelp] = useState(false);
  const title =
    view === "settings"
      ? "Configuración"
      : (navigation.find((n) => n.view === view)?.title ?? "Resumen");
  const newMovement = () =>
    setForm({ type: view === "income" ? "income" : view === "savings" ? "saving" : "expense" });
  const recent = [...s.movements].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  return (
    <div className="app-shell">
      {menuOpen && <div className="backdrop" onClick={() => setMenuOpen(false)} aria-hidden />}
      <aside className={`sidebar ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <span className="brand-icon">
            <Leaf size={20} />
          </span>
          Mis Finanzas
          <Button
            variant="ghost"
            size="icon"
            className="mobile-menu ml-auto"
            aria-label="Cerrar menú"
            onClick={() => setMenuOpen(false)}
          >
            <X />
          </Button>
        </div>
        <div className="nav-label">Tu espacio financiero</div>
        <nav aria-label="Navegación principal" className="nav-list">
          {navigation.map((n) => (
            <Button
              key={n.view}
              variant="ghost"
              asChild
              className={`nav-item justify-start h-auto ${view === n.view ? "active" : ""}`}
            >
              <Link to={n.path} onClick={() => setMenuOpen(false)}>
                <n.icon size={18} />
                {n.title}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Button
            variant="ghost"
            asChild
            className={`nav-item w-full justify-start h-auto ${view === "settings" ? "active" : ""}`}
          >
            <Link to="/configuracion">
              <Settings2 size={18} />
              Configuración
            </Link>
          </Button>
          <div className="local-state">
            <ShieldCheck size={13} />
            {ready ? "Datos guardados en este dispositivo" : "Cargando tus datos…"}
          </div>
          <div className="profile">
            <span className="avatar">ML</span>
            <div>
              <div className="profile-name">Miguel León</div>
              <div className="profile-sub">Mi cuenta personal</div>
            </div>
            <Button variant="ghost" size="icon" asChild title="Configuración de cuenta">
              <Link to="/configuracion" aria-label="Configuración de cuenta">
                <ChevronDown size={14} />
              </Link>
            </Button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <Button
              className="mobile-menu"
              variant="ghost"
              size="icon"
              aria-label="Abrir menú"
              onClick={() => setMenuOpen(true)}
            >
              <Menu />
            </Button>
            <span>Mi espacio</span>
            <ChevronRight size={12} />
            <strong>{title}</strong>
          </div>
          <div className="topbar-right">
            <span className="currency-label">COP · Peso colombiano</span>
            <Button
              variant="ghost"
              size="icon"
              title="Estado de tus compromisos"
              aria-label="Ver compromisos pendientes"
              onClick={() => setHelp(true)}
            >
              <Bell size={17} />
            </Button>
            <span className="avatar size-8">ML</span>
          </div>
        </header>
        <main className="workspace">
          <div className="page-heading">
            <div>
              {view === "summary" && <div className="eyebrow">Tu dinero, con propósito</div>}
              <h1>{view === "summary" ? "Hola, Miguel" : title}</h1>
              <p className="subtitle">
                {view === "summary"
                  ? "Un vistazo a tus finanzas. Cada decisión cuenta."
                  : view === "income"
                    ? "El dinero que recibes, siempre bajo control."
                    : view === "expense"
                      ? "Tus gastos, claros y organizados."
                      : view === "movements"
                        ? "La historia completa de tu dinero."
                        : view === "budgets"
                          ? "Un equilibrio entre tus responsabilidades y tus gustos."
                          : view === "savings"
                            ? "Pequeños pasos hoy, grandes posibilidades mañana."
                            : view === "reports"
                              ? "Tus números reales, una perspectiva más clara."
                              : "Tus finanzas, a tu medida."}
              </p>
            </div>
            <div className="heading-actions">
              {view !== "settings" && (
                <div className="period-control">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Mes anterior"
                    title="Mes anterior"
                    onClick={() => setPeriod(shiftMonth(period, -1))}
                  >
                    <ChevronLeft size={14} />
                  </Button>
                  <input
                    type="month"
                    aria-label="Periodo financiero"
                    value={period}
                    onChange={(e) => {
                      if (/^\d{4}-\d{2}$/.test(e.target.value)) setPeriod(e.target.value);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    aria-label="Mes siguiente"
                    title="Mes siguiente"
                    onClick={() => setPeriod(shiftMonth(period, 1))}
                  >
                    <ChevronRight size={14} />
                  </Button>
                </div>
              )}
              {view !== "settings" && view !== "budgets" && view !== "reports" && (
                <Button onClick={newMovement} disabled={!ready}>
                  <Plus />
                  {view === "savings"
                    ? "Registrar aporte"
                    : view === "income"
                      ? "Nuevo ingreso"
                      : view === "expense"
                        ? "Nuevo gasto"
                        : "Nuevo movimiento"}
                </Button>
              )}
            </div>
          </div>
          {storageError && (
            <p role="alert" className="form-error mb-5">
              {storageError}
            </p>
          )}
          {view === "summary" && (
            <>
              <div className="stats-grid">
                <Stat
                  label="Ingreso neto mensual"
                  value={s.expected}
                  foot="Después de salud y pensión · Estimado"
                  icon={Wallet}
                  salary
                />
                <Stat
                  label="Disponible para ti"
                  value={s.available}
                  foot={
                    s.income
                      ? "Después de reservar tus compromisos"
                      : "Sin ingresos registrados aún"
                  }
                  icon={ArrowUpRight}
                />
                <Stat
                  label="Gastos del mes"
                  value={s.expenses}
                  foot={`${s.movements.filter((m) => m.type === "expense").length} gastos registrados · Sin ahorro`}
                  icon={ArrowDownRight}
                />
                <Stat
                  label="Ahorrado este mes"
                  value={s.used.savings}
                  foot={`${Math.round(progress(s.used.savings, s.budget.savings))}% de tu meta de ${money(s.budget.savings)}`}
                  icon={PiggyBank}
                />
              </div>
              <div className="section-heading">
                <h2>Tu presupuesto, en equilibrio</h2>
                <Button variant="link" size="sm" asChild>
                  <Link to="/presupuestos">
                    Administrar
                    <ArrowRight size={13} />
                  </Link>
                </Button>
              </div>
              <BudgetCards />
              <div className="analysis-grid">
                <BudgetChart budget={s.budget} />
                <ComparisonChart data={data} period={period} />
              </div>
              <section className="movement-section">
                <div className="movement-head">
                  <h2>Últimos movimientos</h2>
                  <Button variant="link" size="sm" asChild>
                    <Link to="/movimientos">
                      Ver todos
                      <ArrowRight size={13} />
                    </Link>
                  </Button>
                </div>
                <MovementsTable
                  rows={recent}
                  onEdit={setForm}
                  onDelete={setDeleting}
                  emptyAction={newMovement}
                />
              </section>
            </>
          )}
          {(view === "income" || view === "expense" || view === "movements") && (
            <>
              <div className="stats-grid">
                <Stat
                  label="Ingresos recibidos"
                  value={s.income}
                  foot="Dinero realmente registrado este mes"
                  icon={ArrowDownLeft}
                  salary
                />
                <Stat
                  label="Gastos de consumo"
                  value={s.expenses}
                  foot="Sin incluir transferencias al ahorro"
                  icon={ArrowUpRight}
                />
                <Stat
                  label="Saldo en cuenta"
                  value={s.cash}
                  foot="Ingresos menos gastos y ahorro"
                  icon={Wallet}
                />
                <Stat
                  label="Compromisos pendientes"
                  value={s.reserved}
                  foot="Transporte, hogar y ahorro"
                  icon={ShieldCheck}
                />
              </div>
              <MovementFilters
                view={view}
                onEdit={setForm}
                onDelete={setDeleting}
                onNew={newMovement}
              />
              {view === "expense" && (
                <div className="notice mt-5">
                  <CircleHelp size={16} />
                  Los aportes al ahorro se registran como transferencias internas. No se incluyen
                  como gastos de consumo.
                </div>
              )}
            </>
          )}
          {view === "budgets" && <BudgetSettings />}
          {view === "savings" && (
            <SavingsView
              onNew={setForm}
              onGoal={() => setGoalForm("new")}
              onEditGoal={setGoalForm}
              onDeleteGoal={setDeletingGoal}
            />
          )}{" "}
          {view === "settings" && <SettingsView />}
          {view === "reports" && <ReportsView />}
          <footer className="footer">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={11} />
              Tus finanzas son personales. Tus datos también.
            </span>
            <span>{monthLabel(period)} · COP</span>
          </footer>
        </main>
      </div>
      {form && <MovementForm initial={form} onClose={() => setForm(null)} />}{" "}
      {goalForm && (
        <GoalForm
          {...(goalForm === "new" ? {} : { initial: goalForm })}
          onClose={() => setGoalForm(null)}
        />
      )}{" "}
      {deleting && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar este movimiento?</DialogTitle>
              <DialogDescription>
                «{deleting.description}» por {money(deleting.amount)} se eliminará. Tu balance se
                recalculará automáticamente. Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <div className="form-actions">
              <Button variant="outline" onClick={() => setDeleting(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (
                    update((previous) => ({
                      ...previous,
                      movements: previous.movements.filter((m) => m.id !== deleting.id),
                    }))
                  ) {
                    setDeleting(null);
                    toast.success("Movimiento eliminado");
                  }
                }}
              >
                Eliminar movimiento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {deletingGoal && (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) setDeletingGoal(null);
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>¿Eliminar este objetivo?</DialogTitle>
              <DialogDescription>
                Se eliminará «{deletingGoal.name}». Sus aportes se conservarán como ahorro general.
              </DialogDescription>
            </DialogHeader>
            <div className="form-actions">
              <Button variant="outline" onClick={() => setDeletingGoal(null)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (
                    update((previous) => ({
                      ...previous,
                      goals: previous.goals.filter((g) => g.id !== deletingGoal.id),
                      movements: previous.movements.map((m) =>
                        m.goalId === deletingGoal.id ? { ...m, goalId: "" } : m,
                      ),
                    }))
                  ) {
                    setDeletingGoal(null);
                    toast.success("Objetivo eliminado; aportes conservados");
                  }
                }}
              >
                Eliminar objetivo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {help && (
        <Dialog open onOpenChange={setHelp}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tus compromisos de {monthLabel(period)}</DialogTitle>
              <DialogDescription>
                Dinero reservado, no gastado. Los aportes reducen el pendiente sin descontar dos
                veces.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {categories
                .filter((c) => c.key !== "personal")
                .map((c) => (
                  <div key={c.key} className="flex justify-between text-sm">
                    <span>{c.name}</span>
                    <strong>
                      {money(Math.max(0, s.budget[c.key] - s.used[c.key]))} pendientes
                    </strong>
                  </div>
                ))}
              <div className="notice">
                Ingresos registrados: {money(s.income)}.{" "}
                {s.shortfall > 0
                  ? `Faltan ${money(s.shortfall)} para cubrir las reservas pendientes.`
                  : "Tus compromisos están cubiertos con el saldo registrado."}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
