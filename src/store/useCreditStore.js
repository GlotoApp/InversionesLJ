import { create } from "zustand";
import { sheetsApi } from "../api/sheets";

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
      set({ error: "Error al cargar créditos: " + e.message, loading: false });
      console.error(e);
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

  clearError: () => set({ error: null }),
}));
