import { z } from "zod";

export const salarySchema = z.object({ base: z.number().int().min(0).max(1e12), transport: z.number().int().min(0).max(1e12), health: z.number().min(0).max(100), pension: z.number().min(0).max(100) });
export const budgetSchema = z.object({ transport: z.number().int().min(0).max(1e12), savings: z.number().int().min(0).max(1e12), home: z.number().int().min(0).max(1e12), personal: z.number().int().min(0).max(1e12) });
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => { const date = new Date(`${value}T12:00:00Z`); return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value; }, "Fecha inválida");
export const movementSchema = z.object({ id: z.string().min(1), type: z.enum(["income", "expense", "saving"]), description: z.string().trim().min(1).max(120), amount: z.number().int().positive().max(1e12), date: dateSchema, category: z.string().min(1).max(60), method: z.string().min(1).max(60), notes: z.string().max(1000), goalId: z.string() });
export const goalSchema = z.object({ id: z.string().min(1), name: z.string().trim().min(1).max(80), target: z.number().int().positive().max(1e12), deadline: z.union([dateSchema, z.literal("")]), description: z.string().max(500) });
export const dataSchema = z.object({ version: z.literal(1), salary: salarySchema, budgets: z.record(budgetSchema), movements: z.array(movementSchema).max(100000), goals: z.array(goalSchema).max(1000) });
export type Salary = z.infer<typeof salarySchema>;
export type Budget = z.infer<typeof budgetSchema>;
export type Movement = z.infer<typeof movementSchema>;
export type Goal = z.infer<typeof goalSchema>;
export type FinanceData = z.infer<typeof dataSchema>;
export type CategoryKey = keyof Budget;
export const DEFAULT_SALARY: Salary = { base: 1750905, transport: 249095, health: 4, pension: 4 };
export const DEFAULT_BUDGET: Budget = { transport: 242000, savings: 500000, home: 500000, personal: 617928 };
export const DEFAULT_DATA: FinanceData = { version: 1, salary: DEFAULT_SALARY, budgets: {}, movements: [], goals: [] };
export const categories = [ { key: "transport", name: "Transporte", hint: "Presupuesto mensual" }, { key: "savings", name: "Ahorro", hint: "Meta mensual" }, { key: "home", name: "Aporte en casa", hint: "Compromiso mensual" }, { key: "personal", name: "Dinero personal", hint: "Para tus gustos" } ] as const;
export const incomeCategories = ["Salario", "Auxilio de transporte", "Bonificaciones", "Ingresos adicionales", "Otros"];
export const expenseCategories = ["Transporte", "Aporte en casa", "Alimentación", "Compras personales", "Entretenimiento", "Regalos", "Educación", "Salud", "Otros"];
export const money = (value: number) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(value);
export const netSalary = (salary: Salary) => salary.base + salary.transport - Math.round(salary.base * salary.health / 100) - Math.round(salary.base * salary.pension / 100);
export const progress = (amount: number, target: number) => target > 0 ? amount / target * 100 : 0;
export const localDate = () => { const now = new Date(); return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`; };
export const monthLabel = (period: string) => new Date(`${period}-02T12:00:00`).toLocaleDateString("es-CO", { month: "long", year: "numeric" });
export const movementCategory = (movement: Movement): CategoryKey => movement.type === "saving" ? "savings" : movement.category === "Transporte" ? "transport" : movement.category === "Aporte en casa" ? "home" : "personal";
export function summarize(data: FinanceData, period: string) {
  const budget = data.budgets[period] ?? DEFAULT_BUDGET;
  const movements = data.movements.filter(m => m.date.startsWith(period));
  const income = movements.filter(m => m.type === "income").reduce((a, m) => a + m.amount, 0);
  const expenses = movements.filter(m => m.type === "expense").reduce((a, m) => a + m.amount, 0);
  const used: Budget = { transport: 0, savings: 0, home: 0, personal: 0 };
  for (const m of movements) if (m.type !== "income") used[movementCategory(m)] += m.amount;
  const reserved = Math.max(0, budget.transport - used.transport) + Math.max(0, budget.home - used.home) + Math.max(0, budget.savings - used.savings);
  const cash = income - expenses - used.savings;
  return { budget, movements, income, expenses, used, reserved, cash, available: Math.max(0, cash - reserved), shortfall: Math.max(0, reserved - cash), accumulated: data.movements.filter(m => m.type === "saving").reduce((a, m) => a + m.amount, 0), expected: netSalary(data.salary) };
}
export function shiftMonth(period: string, delta: number) { const date = new Date(`${period}-02T12:00:00`); date.setMonth(date.getMonth() + delta); return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`; }