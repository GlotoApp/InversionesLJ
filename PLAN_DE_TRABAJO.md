# 📅 Plan de Trabajo — Sistema de Gestión de Créditos

**Proyecto:** Inversiones LJ - Sistema de Créditos  
**Última actualización:** 2 de junio de 2026  
**Estado General:** 🟢 En desarrollo

---

## 📋 Fases del Proyecto

### ✅ FASE 1 — Configuración y Estructura Base

- [x] Crear proyecto con Vite + React
- [x] Instalar Tailwind CSS y configurar
- [x] Instalar Zustand para estado global
- [x] Crear estructura de carpetas
- [x] Configurar variables de entorno (.env)
- [x] Crear archivo postcss.config.js
- [x] Configurar ESLint

### ✅ FASE 2 — Componentes UI Base

- [x] Crear componente `Button.jsx`
- [x] Crear componente `Card.jsx`
- [x] Crear componente `Input.jsx`
- [x] Crear componente `Badge.jsx`
- [x] Crear componente `ProgressBar.jsx`
- [x] Crear utilidad `money.js` (formatMoney, parseMoney)
- [x] Configurar estilos globales (index.css)

### ✅ FASE 3 — Componentes Compartidos

- [x] Crear componente `BackButton.jsx`
- [x] Crear componente `BottomNav.jsx` (navegación inferior)
- [x] Integrar estilos Tailwind en componentes

### ✅ FASE 4 — Google Sheets y API

- [x] Diseñar estructura de hojas en Google Sheets
  - [x] Hoja "Créditos" (campos principales)
  - [x] Hoja "Cronograma" (cuotas)
  - [x] Hoja "Pagos" (registro de pagos)
- [x] Crear Google Apps Script (`Código.gs`)
- [x] Implementar función `doGet()` (consultas)
- [x] Implementar función `doPost()` (guardado y actualizaciones)
- [x] Implementar funciones de lectura (getCreditos, getCronograma, getPagos)
- [x] Implementar función `guardarCredito()`
- [x] Implementar función `registrarPago()`
- [x] Publicar Apps Script como aplicación web
- [x] Crear cliente API en `sheets.js`

### ✅ FASE 5 — Estado Global (Zustand)

- [x] Crear store `useCreditStore.js`
  - [x] Estado para lista de créditos
  - [x] Acciones para cargar créditos
  - [x] Acciones para guardar crédito
  - [x] Acciones para registrar pago
- [x] Crear store `useSimulatorStore.js`
  - [x] Estado para valores del simulador
  - [x] Cálculo de totalFinanciado
  - [x] Cálculo de valorCuota
  - [x] Cálculo de saldo

### ✅ FASE 6 — Páginas Principales

- [x] Crear `HomePage.jsx`
  - [x] Panel de navegación central
  - [x] Enlaces a módulos principales
  - [x] BottomNav integrada
- [x] Crear `SimulatorPage.jsx`
  - [x] Inputs para: valorBase, porcentaje, abonoInicial, numeroCuotas, frecuencia
  - [x] Cálculos en tiempo real
  - [x] Visualización de cronograma estimado
  - [x] Botón para ir a "Nuevo Crédito"
- [x] Crear `NewCreditPage.jsx`
  - [x] Formulario completo de crédito
  - [x] Campos cliente (nombre, teléfono, documento)
  - [x] Campos artículo (descripción, valorBase)
  - [x] Campos financiación (porcentaje, abonoInicial, numeroCuotas, frecuencia)
  - [x] Integración con SimulatorStore
  - [x] Guardar en Google Sheets
  - [x] Feedback de éxito/error
- [x] Crear `PortfolioPage.jsx`
  - [x] Listar todos los créditos
  - [x] Mostrar información resumida por crédito
  - [x] Búsqueda/filtrado de créditos
  - [x] Indicador de estado (activo/pagado/vencido)
  - [x] Resumen contable (total cartera, total pagado)
  - [x] Click para ir a detalle
- [x] Crear `CreditDetailPage.jsx`
  - [x] Información del crédito
  - [x] Información del cliente
  - [x] Cronograma completo de cuotas
  - [x] Indicador de cuotas pagadas/pendientes
  - [x] Formulario para registrar pago
  - [x] Historial de pagos realizados
  - [x] ProgressBar de avance

### ⏳ FASE 7 — Enrutado y App Principal

- [ ] Implementar sistema de enrutado
  - [ ] Usar React Router o estado en App.jsx
  - [ ] Configurar rutas para cada página
  - [ ] Back navigation funcional
- [ ] Crear `App.jsx` con layout principal
  - [ ] Integrar BottomNav
  - [ ] Cambio entre páginas
  - [ ] Gestión de props/estado

### ⏳ FASE 8 — Validación y Manejo de Errores

- [ ] Validar datos en formularios
- [ ] Mostrar mensajes de error claros
- [ ] Manejar fallos de conexión a Google Sheets
- [ ] Validar límites numéricos
- [ ] Evitar envío duplicado de formularios

### ⏳ FASE 9 — Mejoras UX/UI

- [ ] Agregar confirmaciones antes de acciones críticas
- [ ] Loading spinners durante llamadas API
- [ ] Toast notifications para feedback
- [ ] Mejorar responsividad en móvil
- [ ] Agregar animaciones de transición

### ⏳ FASE 10 — Testing y Documentación

- [ ] Tests unitarios para utilidades (money.js)
- [ ] Tests para stores (Zustand)
- [ ] Pruebas de integración API
- [ ] Documentación de funciones en el código
- [ ] Manual de usuario

### ⏳ FASE 11 — Deploy

- [ ] Compilar proyecto (`npm run build`)
- [ ] Preparar hosting (Vercel, Netlify, etc.)
- [ ] Desplegar aplicación
- [ ] Configurar dominio
- [ ] Monitoreo en producción

---

## 🎯 Prioridades Inmediatas

### Alta Prioridad (Necesario para MVP)

1. Completar enrutado y navegación (App.jsx)
2. Finalizar validación de formularios
3. Probar integración completa con Google Sheets
4. Testing básico de flujos principales

### Media Prioridad

1. Mejorar mensajes de error y feedback al usuario
2. Optimizar rendimiento de carga de datos
3. Agregar búsqueda/filtros en cartera

### Baja Prioridad (Futuro)

1. Implementar reportes avanzados
2. Agregar gráficos de análisis
3. Exportar datos a PDF
4. Sincronización con otros sistemas

---

## 📊 Progreso General

```
Completado: 73 tareas
Pendiente:  22 tareas
Progreso:   76.8% ████████████████████░░░
```

---

## 🔧 Notas Técnicas

- **Stack confirmado:** React 18 + Vite + Tailwind CSS + Zustand
- **API:** Google Apps Script (Web App)
- **Base de datos:** Google Sheets
- **Estilos:** Tailwind CSS con tema personalizado
- **Estado:** Zustand (stores independientes por módulo)

---

## 👥 Responsables

- **Desarrollo:** Equipo
- **Base de datos:** Google Sheets
- **Última revisión:** 2 de junio de 2026
