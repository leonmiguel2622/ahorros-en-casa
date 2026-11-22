# Mis Finanzas

Administrador personal en español para ingresos, gastos, presupuestos, ahorro y compromisos en COP.

## Funcionalidades
- Resumen con ingreso neto estimado y dinero realmente disponible.
- Registro, edición y eliminación confirmada de ingresos, gastos y transferencias al ahorro.
- Historial con búsqueda y filtros de tipo, categoría y fecha.
- Presupuestos independientes por mes y metas de ahorro con aportes vinculados.
- Reportes de categorías, meses, transporte semanal y evolución del ahorro.
- Configuración del salario base, auxilio y deducciones.
- Respaldo JSON con importación validada y confirmación de reemplazo.

## Almacenamiento
Los datos se conservan en `localStorage` del navegador actual, bajo `mis-finanzas-v1`. No hay cuenta remota ni sincronización entre dispositivos. Descargar un respaldo antes de borrar datos del navegador. No se crean ingresos ni movimientos ficticios: el salario configurado es una estimación, no un depósito.

## Cálculos
Salario neto = base + auxilio − salud − pensión. Las deducciones se redondean a pesos sobre el salario base, sin auxilio. Saldo en cuenta = ingresos registrados − gastos − transferencias al ahorro. Disponible personal = máximo entre cero y saldo menos compromisos pendientes de transporte, hogar y ahorro. Las reservas no son consumo. El ahorro se resta del saldo, pero no de los gastos de consumo.

## Desarrollo
```sh
bun install
bun run dev
```

Pruebas financieras y navegación:
```sh
bunx vitest run src/test/finance.test.ts src/test/app-routing.test.tsx
```

## Organización
TanStack Start / React / TypeScript. `src/lib/finance.ts` mantiene los cálculos y validaciones; `src/components/finance-store.tsx` administra el almacenamiento; las vistas están en `src/routes/` y los estilos en `src/styles.css`.

## Limitaciones
La carpeta `C:\Miguel\Finanzas` no está disponible desde Lovable y no fue modificada. Esta aplicación utiliza la estructura de proyecto compatible con Lovable, no la estructura local HTML/CSS/JS de ese equipo. No incluye conciliación bancaria, cobros, autenticación ni conexiones a servicios externos. Las compras con tarjeta se registran como gastos, no como un sistema de deuda y pagos de tarjeta.