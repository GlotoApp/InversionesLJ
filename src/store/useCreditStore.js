import { create } from "zustand";
import { sheetsApi } from "../api/sheets";

// Datos simulados para pruebas
const DATOS_SIMULADOS = [
  {
    id: 1,
    C: "Juan García",
    D: "+57 300 1234567",
    E: "1020456789",
    email: "juan.garcia@email.com",
    O: "activo",
    F: "Laptop Dell XPS 15",
    F_costo: 1200000,
    valorBase: 1200000,
    I: 1500000,
    totalFinanciado: 1500000,
    J: 300000,
    abonoInicial: 300000,
    K: 750000,
    saldo: 750000,
    fechaInicio: "2026-01-15",
    fechaVencimiento: "2026-05-15",
    cedulaFrontal: null,
    cedulaTrasera: null,
    fotoRecibo: null,
  },
  {
    id: 2,
    C: "María López",
    D: "+57 301 9876543",
    E: "1020789456",
    email: "maria.lopez@email.com",
    O: "activo",
    F: "iPhone 15 Pro",
    F_costo: 950000,
    valorBase: 950000,
    I: 1200000,
    totalFinanciado: 1200000,
    J: 250000,
    abonoInicial: 250000,
    K: 450000,
    saldo: 450000,
    fechaInicio: "2026-02-01",
    fechaVencimiento: "2026-06-01",
    cedulaFrontal: null,
    cedulaTrasera: null,
    fotoRecibo: null,
  },
  {
    id: 3,
    C: "Carlos Rodríguez",
    D: "+57 302 5551234",
    E: "1020111222",
    email: "carlos.rodriguez@email.com",
    O: "activo",
    F: 'Samsung 55" QLED',
    F_costo: 800000,
    valorBase: 800000,
    I: 1000000,
    totalFinanciado: 1000000,
    J: 200000,
    abonoInicial: 200000,
    K: 300000,
    saldo: 300000,
    fechaInicio: "2026-02-20",
    fechaVencimiento: "2026-05-20",
    cedulaFrontal: null,
    cedulaTrasera: null,
    fotoRecibo: null,
  },
  {
    id: 4,
    C: "Ana Martínez",
    D: "+57 303 4445555",
    E: "1020333444",
    email: "ana.martinez@email.com",
    O: "pagado",
    F: "AirPods Max",
    F_costo: 550000,
    valorBase: 550000,
    I: 700000,
    totalFinanciado: 700000,
    J: 150000,
    abonoInicial: 150000,
    K: 0,
    saldo: 0,
    fechaInicio: "2025-12-01",
    fechaVencimiento: "2026-03-01",
    cedulaFrontal: null,
    cedulaTrasera: null,
    fotoRecibo: null,
  },
  {
    id: 5,
    C: "Pedro Sánchez",
    D: "+57 304 6667777",
    E: "1020555666",
    email: "pedro.sanchez@email.com",
    O: "activo",
    F: "PlayStation 5",
    F_costo: 650000,
    valorBase: 650000,
    I: 850000,
    totalFinanciado: 850000,
    J: 200000,
    abonoInicial: 200000,
    K: 425000,
    saldo: 425000,
    fechaInicio: "2026-03-10",
    fechaVencimiento: "2026-06-10",
    cedulaFrontal: null,
    cedulaTrasera: null,
    fotoRecibo: null,
  },
  {
    id: 6,
    C: "Laura González",
    D: "+57 305 8889999",
    E: "1020777888",
    email: "laura.gonzalez@email.com",
    O: "activo",
    F: "Refrigerador Samsung",
    F_costo: 2500000,
    valorBase: 2500000,
    I: 3000000,
    totalFinanciado: 3000000,
    J: 500000,
    abonoInicial: 500000,
    K: 1500000,
    saldo: 1500000,
    fechaInicio: "2026-01-20",
    fechaVencimiento: "2026-07-20",
    cedulaFrontal: null,
    cedulaTrasera: null,
    fotoRecibo: null,
  },
  {
    id: 7,
    C: "Diego Fernández",
    D: "+57 306 1112222",
    E: "1020999111",
    email: "diego.fernandez@email.com",
    O: "pagado",
    F: "Horno Electrónico LG",
    F_costo: 380000,
    valorBase: 380000,
    I: 500000,
    totalFinanciado: 500000,
    J: 120000,
    abonoInicial: 120000,
    K: 0,
    saldo: 0,
    fechaInicio: "2025-11-15",
    fechaVencimiento: "2026-02-15",
    cedulaFrontal: null,
    cedulaTrasera: null,
    fotoRecibo: null,
  },
  {
    id: 8,
    C: "Sofía Ruiz",
    D: "+57 307 3334444",
    E: "1020222333",
    email: "sofia.ruiz@email.com",
    O: "activo",
    F: "Lavadora Automática",
    F_costo: 1800000,
    valorBase: 1800000,
    I: 2200000,
    totalFinanciado: 2200000,
    J: 400000,
    abonoInicial: 400000,
    K: 900000,
    saldo: 900000,
    fechaInicio: "2026-02-10",
    fechaVencimiento: "2026-08-10",
    cedulaFrontal: null,
    cedulaTrasera: null,
    fotoRecibo: null,
  },
];

export const useCreditStore = create((set) => ({
  creditos: [],
  cronograma: [],
  pagos: [],
  creditoActivo: null,
  loading: false,
  error: null,

  fetchCreditos: async () => {
    set({ loading: true, error: null });
    try {
      const creditos = await sheetsApi.getCreditos();
      set({ creditos, loading: false });
    } catch (e) {
      console.warn(
        "Error al cargar créditos, usando datos simulados:",
        e.message,
      );
      // Usar datos simulados como fallback
      set({ creditos: DATOS_SIMULADOS, loading: false, error: null });
    }
  },

  fetchDetalle: async (creditoId) => {
    set({ loading: true });
    try {
      const [cronograma, pagos] = await Promise.all([
        sheetsApi.getCronograma(creditoId),
        sheetsApi.getPagos(creditoId),
      ]);
      set({ cronograma, pagos, loading: false });
    } catch (e) {
      set({ error: "Error al cargar detalle: " + e.message, loading: false });
      console.error(e);
    }
  },

  guardarCredito: async (credito) => {
    set({ loading: true, error: null });
    try {
      const result = await sheetsApi.guardarCredito(credito);
      set({ loading: false });
      return result;
    } catch (e) {
      set({ error: "Error al guardar crédito: " + e.message, loading: false });
      throw e;
    }
  },

  registrarPago: async (creditoId, monto, nota) => {
    set({ loading: true, error: null });
    try {
      const result = await sheetsApi.registrarPago(creditoId, monto, nota);
      set({ loading: false });
      return result;
    } catch (e) {
      set({ error: "Error al registrar pago: " + e.message, loading: false });
      throw e;
    }
  },

  setCreditoActivo: (credito) => set({ creditoActivo: credito }),

  // Guarda foto en base64 dentro del crédito en memoria
  guardarFotoCredito: (creditoId, campo, base64) =>
    set((state) => ({
      creditos: state.creditos.map((c) =>
        c.id === creditoId ? { ...c, [campo]: base64 } : c,
      ),
    })),

  clearError: () => set({ error: null }),
}));
