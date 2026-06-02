const API_URL = import.meta.env.VITE_API_URL;

async function get(action, params = {}) {
  try {
    const query = new URLSearchParams({ action, ...params }).toString();
    const res = await fetch(`${API_URL}?${query}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("GET error:", e);
    throw e;
  }
}

async function post(body) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("POST error:", e);
    throw e;
  }
}

export const sheetsApi = {
  getCreditos: () => get("getCreditos"),
  getCronograma: (creditoId) => get("getCronograma", { creditoId }),
  getPagos: (creditoId) => get("getPagos", { creditoId }),
  guardarCredito: (credito) => post({ action: "guardarCredito", credito }),
  registrarPago: (creditoId, monto, nota) =>
    post({ action: "registrarPago", creditoId, monto, nota }),
};
