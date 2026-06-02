# 📋 Documentación — Sistema de Gestión de Créditos
> Stack: **React + Vite + Tailwind CSS + Zustand**  
> Base de datos: **Google Sheets** vía Google Apps Script (Web App)  
> Arquitectura: SPA con enrutado por estado, componentes funcionales con hooks

---

## 1. Visión General

Sistema para financiar artículos a personas, aplicando un porcentaje de incremento sobre el valor base del producto. Genera cuotas periódicas, registra el abono inicial y lleva la contabilidad completa desde Google Sheets.

### Módulos

| Módulo | Componente principal | Descripción |
|---|---|---|
| 🏠 Home | `HomePage` | Panel de navegación central |
| 🔵 Simulador | `SimulatorPage` | Calcula montos y cronograma |
| 🟢 Nuevo Crédito | `NewCreditPage` | Formulario + guardar en Sheets |
| 🟡 Cartera | `PortfolioPage` | Lista y resumen contable |
| 🔴 Detalle | `CreditDetailPage` | Cronograma + registrar pagos |

---

## 2. Estructura del Proyecto

```
creditos-app/
├── public/
├── src/
│   ├── api/
│   │   └── sheets.js          ← Cliente API (Apps Script)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Card.jsx
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Badge.jsx
│   │   │   └── ProgressBar.jsx
│   │   └── shared/
│   │       ├── BottomNav.jsx
│   │       └── BackButton.jsx
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── SimulatorPage.jsx
│   │   ├── NewCreditPage.jsx
│   │   ├── PortfolioPage.jsx
│   │   └── CreditDetailPage.jsx
│   ├── store/
│   │   ├── useSimulatorStore.js   ← Estado del simulador
│   │   └── useCreditStore.js      ← Estado de créditos/cartera
│   ├── utils/
│   │   └── money.js           ← formatMoney, parseMoney
│   ├── App.jsx
│   └── main.jsx
├── index.html
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## 3. Instalación y Configuración

### Paso 1 — Crear el proyecto

```bash
npm create vite@latest creditos-app -- --template react
cd creditos-app
npm install
```

### Paso 2 — Instalar dependencias

```bash
# Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Zustand (estado global)
npm install zustand
```

### Paso 3 — Configurar Tailwind

**`tailwind.config.js`**
```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

**`src/index.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #f1f5f9;
  -webkit-tap-highlight-color: transparent;
}

.glass-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(12px);
  border-radius: 1.25rem;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button { -webkit-appearance: none; }
```

### Paso 4 — Variables de entorno

Crear archivo **`.env`** en la raíz:

```env
VITE_API_URL=https://script.google.com/macros/s/TU_ID_AQUI/exec
```

> ⚠️ Agregar `.env` al `.gitignore` para no exponer la URL del script.

---

## 4. Google Sheets — Base de Datos

### Estructura de hojas

#### Hoja `Créditos`
| A: id | B: fechaCreacion | C: clienteNombre | D: clienteTelefono | E: clienteDocumento | F: articuloDescripcion | G: valorBase | H: porcentaje | I: totalFinanciado | J: abonoInicial | K: saldo | L: numeroCuotas | M: valorCuota | N: frecuencia | O: estado |

#### Hoja `Cronograma`
| A: creditoId | B: numeroCuota | C: fechaVencimiento | D: valorCuota | E: pagado |

#### Hoja `Pagos`
| A: creditoId | B: fecha | C: monto | D: nota |

---

## 5. Google Apps Script

### Crear y publicar

1. Abrir el Google Sheets → **Extensiones → Apps Script**
2. Pegar el código de `Código.gs` (ver abajo)
3. **Implementar → Nueva implementación → Aplicación web**
4. Ejecutar como: **Yo** | Acceso: **Cualquier persona**
5. Copiar la URL generada → pegar en `.env` como `VITE_API_URL`

### `Código.gs`

```javascript
const SS = SpreadsheetApp.getActiveSpreadsheet();

function doGet(e) {
  const action = e.parameter.action;
  let result;
  if (action === 'getCreditos')        result = getCreditos();
  else if (action === 'getCronograma') result = getCronograma(e.parameter.creditoId);
  else if (action === 'getPagos')      result = getPagos(e.parameter.creditoId);
  else result = { error: 'Acción no reconocida' };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  let result;
  if (action === 'guardarCredito')      result = guardarCredito(body.credito);
  else if (action === 'registrarPago')  result = registrarPago(body.creditoId, body.monto, body.nota);
  else result = { error: 'Acción no reconocida' };
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function getCreditos() {
  const hoja = SS.getSheetByName('Créditos');
  const datos = hoja.getDataRange().getValues();
  const cab = datos[0];
  return datos.slice(1).map(f => Object.fromEntries(cab.map((k, i) => [k, f[i]])));
}

function getCronograma(creditoId) {
  const hoja = SS.getSheetByName('Cronograma');
  const datos = hoja.getDataRange().getValues();
  const cab = datos[0];
  return datos.slice(1)
    .filter(f => String(f[0]) === String(creditoId))
    .map(f => Object.fromEntries(cab.map((k, i) => [k, f[i]])));
}

function getPagos(creditoId) {
  const hoja = SS.getSheetByName('Pagos');
  const datos = hoja.getDataRange().getValues();
  const cab = datos[0];
  return datos.slice(1)
    .filter(f => String(f[0]) === String(creditoId))
    .map(f => Object.fromEntries(cab.map((k, i) => [k, f[i]])));
}

function guardarCredito(credito) {
  const hojaCred = SS.getSheetByName('Créditos');
  const hojaCron = SS.getSheetByName('Cronograma');
  const id = Date.now();
  hojaCred.appendRow([
    id, new Date().toISOString(),
    credito.clienteNombre, credito.clienteTelefono, credito.clienteDocumento,
    credito.articuloDescripcion, credito.valorBase, credito.porcentaje,
    credito.totalFinanciado, credito.abonoInicial, credito.saldo,
    credito.numeroCuotas, credito.valorCuota, credito.frecuencia, 'activo'
  ]);
  const hoy = new Date();
  for (let i = 1; i <= credito.numeroCuotas; i++) {
    const fecha = new Date(hoy);
    if (credito.frecuencia === 'diario')    fecha.setDate(fecha.getDate() + i);
    if (credito.frecuencia === 'semanal')   fecha.setDate(fecha.getDate() + i * 7);
    if (credito.frecuencia === 'quincenal') fecha.setDate(fecha.getDate() + i * 15);
    hojaCron.appendRow([id, i, fecha.toISOString().split('T')[0], credito.valorCuota, false]);
  }
  return { ok: true, id };
}

function registrarPago(creditoId, monto, nota) {
  const hojaPagos = SS.getSheetByName('Pagos');
  const hojaCron  = SS.getSheetByName('Cronograma');
  const hojaCred  = SS.getSheetByName('Créditos');

  hojaPagos.appendRow([creditoId, new Date().toISOString(), monto, nota || '']);

  const datosCron = hojaCron.getDataRange().getValues();
  let restante = monto;
  for (let i = 1; i < datosCron.length; i++) {
    if (String(datosCron[i][0]) === String(creditoId) && datosCron[i][4] === false) {
      if (restante >= datosCron[i][3]) {
        hojaCron.getRange(i + 1, 5).setValue(true);
        restante -= datosCron[i][3];
      }
    }
  }

  const cronActualizado = hojaCron.getDataRange().getValues();
  const saldoPendiente = cronActualizado.slice(1)
    .filter(f => String(f[0]) === String(creditoId) && f[4] === false)
    .reduce((s, f) => s + f[3], 0);

  const datosCred = hojaCred.getDataRange().getValues();
  for (let i = 1; i < datosCred.length; i++) {
    if (String(datosCred[i][0]) === String(creditoId)) {
      hojaCred.getRange(i + 1, 11).setValue(saldoPendiente);
      hojaCred.getRange(i + 1, 15).setValue(saldoPendiente <= 0 ? 'pagado' : 'activo');
      break;
    }
  }
  return { ok: true, saldoPendiente };
}
```

---

## 6. Cliente API — `src/api/sheets.js`

```js
const API_URL = import.meta.env.VITE_API_URL;

async function get(action, params = {}) {
  const query = new URLSearchParams({ action, ...params }).toString();
  const res = await fetch(`${API_URL}?${query}`);
  return res.json();
}

async function post(body) {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return res.json();
}

export const sheetsApi = {
  getCreditos:    ()                       => get('getCreditos'),
  getCronograma:  (creditoId)              => get('getCronograma', { creditoId }),
  getPagos:       (creditoId)              => get('getPagos', { creditoId }),
  guardarCredito: (credito)                => post({ action: 'guardarCredito', credito }),
  registrarPago:  (creditoId, monto, nota) => post({ action: 'registrarPago', creditoId, monto, nota }),
};
```

---

## 7. Utilidades — `src/utils/money.js`

```js
export const formatMoney = (n) => {
  if (isNaN(n) || n === null) return '0';
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseMoney = (v) => {
  if (!v) return 0;
  return parseInt(v.toString().replace(/\D/g, '')) || 0;
};
```

---

## 8. Stores (Zustand)

### `src/store/useSimulatorStore.js`

```js
import { create } from 'zustand';

export const useSimulatorStore = create((set, get) => ({
  baseValue:        0,
  percent:          0,
  totalValue:       0,
  downPayment:      0,
  installments:     4,
  installmentValue: 0,
  frequency:        'semanal',

  setField: (key, value) => set({ [key]: value }),

  calcFromBase: () => {
    const { baseValue, percent, installments, downPayment } = get();
    const totalValue = baseValue + baseValue * (percent / 100);
    const saldo = totalValue - downPayment;
    const installmentValue = installments > 0 ? saldo / installments : 0;
    set({ totalValue, installmentValue });
  },

  calcFromTotal: () => {
    const { totalValue, baseValue, installments, downPayment } = get();
    const percent = baseValue > 0 ? ((totalValue - baseValue) / baseValue) * 100 : 0;
    const saldo = totalValue - downPayment;
    const installmentValue = installments > 0 ? saldo / installments : 0;
    set({ percent, installmentValue });
  },

  calcFromInstallmentValue: () => {
    const { installmentValue, totalValue, downPayment } = get();
    const saldo = totalValue - downPayment;
    const installments = installmentValue > 0 ? Math.ceil(saldo / installmentValue) : 0;
    set({ installments });
  },

  recalcInstallments: () => {
    const { totalValue, downPayment, installments } = get();
    const saldo = totalValue - downPayment;
    const installmentValue = installments > 0 ? saldo / installments : 0;
    set({ installmentValue });
  },

  getCronograma: () => {
    const { installments, installmentValue, frequency } = get();
    const hoy = new Date();
    return Array.from({ length: Math.min(installments, 100) }, (_, idx) => {
      const i = idx + 1;
      const fecha = new Date(hoy);
      if (frequency === 'diario')    fecha.setDate(fecha.getDate() + i);
      if (frequency === 'semanal')   fecha.setDate(fecha.getDate() + i * 7);
      if (frequency === 'quincenal') fecha.setDate(fecha.getDate() + i * 15);
      return { numero: i, fecha, valor: installmentValue };
    });
  },
}));
```

---

### `src/store/useCreditStore.js`

```js
import { create } from 'zustand';
import { sheetsApi } from '../api/sheets';

export const useCreditStore = create((set) => ({
  creditos:       [],
  cronograma:     [],
  pagos:          [],
  creditoActivo:  null,
  loading:        false,
  error:          null,

  fetchCreditos: async () => {
    set({ loading: true, error: null });
    try {
      const creditos = await sheetsApi.getCreditos();
      set({ creditos, loading: false });
    } catch (e) {
      set({ error: 'Error al cargar créditos', loading: false });
    }
  },

  fetchDetalle: async (creditoId) => {
    set({ loading: true });
    const [cronograma, pagos] = await Promise.all([
      sheetsApi.getCronograma(creditoId),
      sheetsApi.getPagos(creditoId),
    ]);
    set({ cronograma, pagos, loading: false });
  },

  guardarCredito: async (credito) => {
    set({ loading: true });
    const result = await sheetsApi.guardarCredito(credito);
    set({ loading: false });
    return result;
  },

  registrarPago: async (creditoId, monto, nota) => {
    set({ loading: true });
    const result = await sheetsApi.registrarPago(creditoId, monto, nota);
    set({ loading: false });
    return result;
  },

  setCreditoActivo: (credito) => set({ creditoActivo: credito }),
}));
```

---

## 9. Enrutado — `src/App.jsx`

```jsx
import { useState } from 'react';
import HomePage         from './pages/HomePage';
import SimulatorPage    from './pages/SimulatorPage';
import NewCreditPage    from './pages/NewCreditPage';
import PortfolioPage    from './pages/PortfolioPage';
import CreditDetailPage from './pages/CreditDetailPage';

export default function App() {
  const [page, setPage] = useState('home');

  const navigate = (p) => { setPage(p); window.scrollTo(0, 0); };

  const pages = {
    home:         <HomePage         navigate={navigate} />,
    simulator:    <SimulatorPage    navigate={navigate} />,
    newCredit:    <NewCreditPage    navigate={navigate} />,
    portfolio:    <PortfolioPage    navigate={navigate} />,
    creditDetail: <CreditDetailPage navigate={navigate} />,
  };

  return (
    <div className="max-w-md mx-auto min-h-screen px-4 py-6">
      {pages[page] ?? pages.home}
    </div>
  );
}
```

---

## 10. Páginas — Estructura de cada componente

### `HomePage.jsx`
```jsx
export default function HomePage({ navigate }) {
  return (
    <div className="fade-in space-y-8">
      {/* Header */}
      {/* Grid 2x2: Simulador | Nuevo Crédito | Cartera | (futuro) */}
      {/* Cada card llama navigate('simulator'), navigate('newCredit'), etc. */}
    </div>
  );
}
```

---

### `SimulatorPage.jsx`
```jsx
import { useSimulatorStore } from '../store/useSimulatorStore';
import { formatMoney, parseMoney } from '../utils/money';

export default function SimulatorPage({ navigate }) {
  const store = useSimulatorStore();
  // Inputs controlados que llaman store.setField() + store.calcFromBase() etc.
  // Cronograma generado con store.getCronograma()
  // Botón "Guardar como Crédito" → navigate('newCredit')
  // Botón "Copiar" → genera texto para WhatsApp
}
```

---

### `NewCreditPage.jsx`
```jsx
import { useSimulatorStore } from '../store/useSimulatorStore';
import { useCreditStore }    from '../store/useCreditStore';

export default function NewCreditPage({ navigate }) {
  // Campos: nombre, teléfono, documento, descripción del artículo
  // Al guardar: arma el objeto crédito con datos del simulador + formulario
  // Llama useCreditStore.guardarCredito(credito)
  // En éxito → navigate('portfolio')
}
```

---

### `PortfolioPage.jsx`
```jsx
import { useEffect, useState } from 'react';
import { useCreditStore } from '../store/useCreditStore';

export default function PortfolioPage({ navigate }) {
  const { creditos, fetchCreditos, loading, setCreditoActivo } = useCreditStore();
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => { fetchCreditos(); }, []);

  // Resumen contable: cartera total, recaudado, activos, vencidos
  // Filtros: Todos | Activos | Vencidos | Pagados
  // Lista de créditos → al tocar: setCreditoActivo(c) + navigate('creditDetail')
}
```

---

### `CreditDetailPage.jsx`
```jsx
import { useEffect, useState } from 'react';
import { useCreditStore } from '../store/useCreditStore';

export default function CreditDetailPage({ navigate }) {
  const { creditoActivo, cronograma, pagos, fetchDetalle, registrarPago } = useCreditStore();
  const [montoPago, setMontoPago] = useState('');

  useEffect(() => {
    if (creditoActivo) fetchDetalle(creditoActivo.id);
  }, [creditoActivo]);

  // Datos del cliente y artículo
  // Barra de progreso: % pagado
  // Cronograma: ✅ pagada / 🔴 vencida / ⏳ pendiente
  // Input monto + botón "Registrar Pago"
  // Historial de pagos
}
```

---

## 11. Componentes UI Reutilizables

### `Card.jsx`
```jsx
export function Card({ children, className = '', accent }) {
  const border = accent ? `border-b-4 border-${accent}-500` : '';
  return (
    <div className={`glass-card p-5 ${border} ${className}`}>
      {children}
    </div>
  );
}
```

### `Button.jsx`
```jsx
export function Button({ children, onClick, variant = 'primary', loading }) {
  const variants = {
    primary:   'bg-blue-600 text-white hover:bg-blue-700',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700',
    ghost:     'bg-slate-100 text-slate-700 hover:bg-slate-200',
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${variants[variant]} disabled:opacity-50`}
    >
      {loading ? 'Cargando...' : children}
    </button>
  );
}
```

### `Badge.jsx`
```jsx
const colors = {
  activo:  'bg-emerald-100 text-emerald-700',
  vencido: 'bg-red-100 text-red-700',
  pagado:  'bg-slate-100 text-slate-500',
};

export function Badge({ estado }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${colors[estado] ?? colors.activo}`}>
      {estado}
    </span>
  );
}
```

### `ProgressBar.jsx`
```jsx
export function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div
        className="bg-emerald-500 h-2 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

---

## 12. Orden de Construcción

```
[1] npm create vite + instalar dependencias
[2] Configurar Tailwind + index.css (estilos base)
[3] Crear .env con VITE_API_URL vacío por ahora
[4] Crear src/utils/money.js
[5] Crear src/api/sheets.js
[6] Montar Google Sheets (3 hojas) + Apps Script + publicar
[7] Pegar la URL en .env
[8] Crear src/store/useSimulatorStore.js
[9] Construir SimulatorPage (portar lógica del index.html)
[10] Crear src/store/useCreditStore.js
[11] Construir NewCreditPage
[12] Construir PortfolioPage
[13] Construir CreditDetailPage
[14] Construir componentes UI (Card, Button, Badge, ProgressBar)
[15] Conectar todo en App.jsx
```

---

## 13. Referencia Rápida de la API

| Acción | Método | Parámetros | Retorna |
|---|---|---|---|
| `getCreditos` | GET | — | `Crédito[]` |
| `getCronograma` | GET | `creditoId` | `Cuota[]` |
| `getPagos` | GET | `creditoId` | `Pago[]` |
| `guardarCredito` | POST | `credito {}` | `{ ok, id }` |
| `registrarPago` | POST | `creditoId, monto, nota` | `{ ok, saldoPendiente }` |

---

## 14. Porcentajes de Referencia (regla de negocio)

| Modalidad | Rango |
|---|---|
| Venta libre | 20% – 25% |
| Crédito en cuotas | 40% – 50% |

---

*Stack: React 18 + Vite + Tailwind CSS + Zustand — Base de datos: Google Sheets vía Apps Script*
