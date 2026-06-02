import { create } from "zustand";

// Helper para obtener el máximo de cuotas permitido según los 6 meses sagrados
const getMaxInstallments = (frequency) => {
  if (frequency === "mensual") return 6; // 6 meses = 6 cuotas
  if (frequency === "quincenal") return 12; // 6 meses * 2 quincenas = 12 cuotas
  if (frequency === "semanal") return 24; // 6 meses * 4 semanas = 24 cuotas
  return 24;
};

export const useSimulatorStore = create((set, get) => ({
  productName: "",
  baseValue: 0,
  percent: 50, // Mínimo inicial por regla de negocio previa
  totalValue: 0,
  downPayment: 0,
  installments: 0, // Usuario debe ingresar las cuotas obligatoriamente
  installmentValue: 0,
  frequency: "semanal", // Frecuencia por defecto inicial

  setField: (key, value) => set({ [key]: value }),

  // Cambiar frecuencia aplicando límites automáticos inmediatos
  changeFrequency: (newFreq) => {
    const maxAllowed = getMaxInstallments(newFreq);
    let currentInstallments = get().installments;

    // Si las cuotas actuales superan el nuevo máximo, las bajamos al tope de 6 meses
    if (currentInstallments > maxAllowed) {
      currentInstallments = maxAllowed;
    }
    // Si está vacío, lo dejamos en 0 para que el usuario lo ingrese

    set({ frequency: newFreq, installments: currentInstallments });
    get().recalcInstallments();
  },

  // Cambiar cuotas asegurando que no pase el límite de los 6 meses
  changeInstallments: (num) => {
    const { frequency } = get();
    const maxAllowed = getMaxInstallments(frequency);

    // Forzar que esté entre 1 y el tope máximo de 6 meses
    let sanitized = Math.max(1, parseInt(num) || 1);
    if (sanitized > maxAllowed) {
      sanitized = maxAllowed;
    }

    set({ installments: sanitized });
    get().recalcInstallments();
  },

  calcFromBase: () => {
    const { baseValue, percent, installments, downPayment } = get();
    const totalValue = baseValue + baseValue * (percent / 100);
    const saldo = Math.max(0, totalValue - downPayment);
    const installmentValue = installments > 0 ? saldo / installments : 0;
    set({ totalValue, installmentValue });
  },

  calcFromTotal: () => {
    const { totalValue, baseValue, installments, downPayment } = get();
    const percent =
      baseValue > 0 ? ((totalValue - baseValue) / baseValue) * 100 : 50;
    const saldo = Math.max(0, totalValue - downPayment);
    const installmentValue = installments > 0 ? saldo / installments : 0;
    set({ percent, installmentValue });
  },

  calcFromInstallmentValue: () => {
    const { installmentValue, totalValue, downPayment, frequency } = get();
    const saldo = Math.max(0, totalValue - downPayment);

    let installments =
      installmentValue > 0 ? Math.ceil(saldo / installmentValue) : 1;
    const maxAllowed = getMaxInstallments(frequency);

    // Si el valor digitado da más cuotas de lo permitido, topamos a los 6 meses
    if (installments > maxAllowed) {
      installments = maxAllowed;
    }

    set({ installments });
    // Recalculamos el valor real exacto para ajustar centavos/redondeos
    get().recalcInstallments();
  },

  recalcInstallments: () => {
    const { totalValue, downPayment, installments } = get();
    const saldo = Math.max(0, totalValue - downPayment);
    const installmentValue = installments > 0 ? saldo / installments : 0;
    set({ installmentValue });
  },

  getCronograma: () => {
    const { installments, installmentValue, frequency } = get();
    const hoy = new Date();

    return Array.from({ length: Math.min(installments, 24) }, (_, idx) => {
      const i = idx + 1;
      const fecha = new Date(hoy);

      if (frequency === "semanal") {
        fecha.setDate(fecha.getDate() + i * 7);
      } else if (frequency === "quincenal") {
        fecha.setDate(fecha.getDate() + i * 15);
      } else if (frequency === "mensual") {
        fecha.setMonth(fecha.getMonth() + i);
      }

      return { numero: i, fecha, valor: installmentValue };
    });
  },

  resetStore: () => {
    set({
      productName: "",
      baseValue: 0,
      percent: 50,
      totalValue: 0,
      downPayment: 0,
      installments: 0,
      installmentValue: 0,
      frequency: "semanal",
    });
  },
}));
