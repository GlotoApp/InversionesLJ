import { useEffect, useRef } from "react";
import { useSimulatorStore } from "../store/useSimulatorStore";
import { formatMoney, parseMoney } from "../utils/money";
import { Card } from "../components/ui/Card";
import { BackButton } from "../components/shared/BackButton";

export default function SimulatorPage({ navigate }) {
  const store = useSimulatorStore();
  const btnCopyRef = useRef(null);

  useEffect(() => {
    store.calcFromBase();
  }, []);

  const balance = Math.max(store.totalValue - store.downPayment, 0);
  const cronograma = store.getCronograma();

  const getMaxCuotasTexto = () => {
    if (store.frequency === "mensual") return "Máximo 6 cuotas";
    if (store.frequency === "quincenal") return "Máximo 12 cuotas";
    return "Máximo 24 cuotas";
  };

  // --- CONTROLADOR DE ENTRADA CON FORMATO EN VIVO ---
  const handleLiveMoneyInput = (e, callback) => {
    const inputElement = e.target;
    const cursorPosition = inputElement.selectionStart;
    const oldLength = inputElement.value.length;

    const rawValue = parseMoney(inputElement.value);
    inputElement.value = rawValue === 0 ? "" : formatMoney(rawValue);

    const newLength = inputElement.value.length;
    const adjustedCursor = cursorPosition + (newLength - oldLength);
    inputElement.setSelectionRange(adjustedCursor, adjustedCursor);

    callback(rawValue);
  };

  // --- MANEJADORES DE EVENTOS ---
  const onBaseValueChange = (e) => {
    handleLiveMoneyInput(e, (val) => {
      store.setField("baseValue", val);
      store.calcFromBase();
    });
  };

  const onPercentChange = (e) => {
    const val = parseFloat(e.target.value) || 50;
    store.setField("percent", val);
    store.calcFromBase();
  };

  const onTotalValueChange = (e) => {
    handleLiveMoneyInput(e, (val) => {
      store.setField("totalValue", val);
      store.calcFromTotal();
    });
  };

  const onDownPaymentChange = (e) => {
    handleLiveMoneyInput(e, (val) => {
      const rawVal = Math.min(val, store.totalValue);
      store.setField("downPayment", rawVal);
      store.recalcInstallments();
    });
  };

  const onInstallmentsChange = (e) => {
    store.changeInstallments(e.target.value);
  };

  const onFrequencySelect = (freq) => {
    store.changeFrequency(freq);
  };

  const handleClearSimulation = () => {
    store.resetStore();
  };

  const handleProceedToNewCredit = () => {
    const errors = [];

    // Validar nombre del producto
    if (!store.productName || store.productName.trim() === "") {
      errors.push("Nombre del Producto");
    }

    // Validar valor base
    if (store.baseValue <= 0) {
      errors.push("Valor Base Producto");
    }

    // Validar total a financiar
    if (store.totalValue <= 0) {
      errors.push("Total a Financiar");
    }

    // Validar cuota inicial
    if (store.downPayment < 0) {
      errors.push("Cuota Inicial");
    }

    // Validar número de cuotas
    if (store.installments <= 0) {
      errors.push("Número de Cuotas");
    }

    if (errors.length > 0) {
      alert(
        `⚠️ Por favor, completa todos los campos:\n\n❌ ${errors.join("\n❌ ")}`,
      );
      // Scroll al inicio del formulario
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    navigate("newCredit");
  };

  // --- ACCIÓN: COPIAR PORTAPAPELES ---
  const handleCopySimulation = async () => {
    if (store.installments <= 0) return;

    let cronoText = "";
    cronograma.forEach((cuota) => {
      if (cuota.numero <= 12) {
        const day = cuota.fecha.getDate();
        const monthName = cuota.fecha.toLocaleDateString("es-CO", {
          month: "long",
        });
        const year = cuota.fecha.getFullYear().toString().slice(-2);
        const dateStr = `${day}/${monthName}/${year}`;

        cronoText += `🔹 *C${cuota.numero}:* ${dateStr} → *$${formatMoney(cuota.valor)}*\n`;
      }
    });

    if (store.installments > 12) {
      cronoText += `... _(+${store.installments - 12} cuotas adicionales)_\n`;
    }

    const textToCopy =
      `*📊 SIMULACIÓN DE CRÉDITO*\n` +
      `----------------------------\n` +
      `*Producto:* ${store.productName || "No especificado"}\n` +
      `*Total:* $${formatMoney(store.totalValue)}\n` +
      `*Inicial:* $${formatMoney(store.downPayment)}\n` +
      `*Saldo:* $${formatMoney(balance)}\n` +
      `----------------------------\n` +
      `*PAGOS (${store.frequency.toUpperCase()})*\n\n` +
      `${cronoText}` +
      `----------------------------\n` +
      `⚠️ *IMPORTANTE - PENALIZACIÓN POR ATRASO:*\n` +
      `Las cuotas no pagadas en la fecha vencimiento generarán un interés del 1% por cada día tardío.\n` +
      `Ejemplo: Si se atrasa 10 días, el monto será 10% más caro.\n` +
      `El interés se suma automáticamente al capital adeudado.\n`;

    try {
      await navigator.clipboard.writeText(textToCopy);

      if (btnCopyRef.current) {
        const originalText = btnCopyRef.current.innerText;
        btnCopyRef.current.innerText = "¡COPIADO EL PLAN!";
        btnCopyRef.current.style.backgroundColor = "#10b981";
        btnCopyRef.current.style.color = "#ffffff";

        setTimeout(() => {
          btnCopyRef.current.innerText = originalText;
          btnCopyRef.current.style.backgroundColor = "#ffffff";
          btnCopyRef.current.style.color = "#0f172a";
        }, 2000);
      }
    } catch (err) {
      console.error("Error al copiar al portapapeles: ", err);
    }
  };

  return (
    <div className="fade-in space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <BackButton onClick={() => navigate("home")} />
        <button
          type="button"
          onClick={handleClearSimulation}
          className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-200 transition-all active:scale-95 uppercase tracking-wider"
        >
          Limpiar
        </button>
      </div>

      {/* Bloque 1: Cálculo de Montos */}
      <Card className="space-y-5">
        <h2 className="text-lg font-bold text-slate-800 border-b pb-3 flex items-center gap-2">
          <span>🔵</span> Cálculo de Montos
        </h2>

        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nombre del Producto
            </label>
            <input
              type="text"
              placeholder="Ej. Celular, Nevera..."
              value={store.productName || ""}
              onChange={(e) => store.setField("productName", e.target.value)}
              className={`w-full mt-1 p-3 bg-slate-50 border rounded-xl outline-none font-bold text-sm focus:ring-2 transition-all text-slate-800 ${
                !store.productName || store.productName.trim() === ""
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-200 focus:ring-blue-500"
              }`}
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Valor Base Producto
            </label>
            <input
              type="text"
              placeholder="0"
              value={store.baseValue === 0 ? "" : formatMoney(store.baseValue)}
              onInput={onBaseValueChange}
              className={`w-full mt-1 p-3 bg-slate-50 border rounded-xl outline-none font-bold text-lg focus:ring-2 transition-all text-slate-800 ${
                store.baseValue <= 0
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-200 focus:ring-blue-500"
              }`}
            />
          </div>

          {/* Incremento porcentual */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-blue-700 uppercase">
                Incremento %
              </label>
              <input
                type="number"
                min="50"
                max="100"
                value={
                  store.percent % 1 === 0
                    ? store.percent
                    : store.percent.toFixed(1)
                }
                onChange={(e) => {
                  const val = Math.max(50, parseFloat(e.target.value) || 50);
                  store.setField("percent", val);
                  store.calcFromBase();
                }}
                className="w-16 bg-blue-600 text-white rounded-lg text-center font-bold text-xs py-1 outline-none"
              />
            </div>
            <div className="flex flex-col text-[10px] font-bold text-blue-500 space-y-0.5">
              <span>• Crédito Cuotas: Mínimo 50%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={Math.max(50, store.percent)}
              onChange={onPercentChange}
              className="w-full h-1.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Banner Total Financiar */}
          <div
            className={`p-4 rounded-xl text-white shadow-md ${
              store.totalValue <= 0
                ? "bg-gradient-to-r from-red-600 to-red-700 border-2 border-red-500"
                : "bg-gradient-to-r from-blue-600 to-blue-700"
            }`}
          >
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider mb-1">
              Total a Financiar
            </p>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold">$</span>
              <input
                type="text"
                value={
                  store.totalValue === 0 ? "" : formatMoney(store.totalValue)
                }
                onInput={onTotalValueChange}
                className="bg-transparent border-b focus:border-white outline-none w-full text-2xl font-black text-white transition-all"
                style={{
                  borderBottomColor:
                    store.totalValue <= 0 ? "#ef4444" : "#93c5fd",
                }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Bloque 2: Plan de Pagos */}
      <Card className="space-y-5 border-t-4 border-emerald-500">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
          <span>🟢</span> Plan de Pagos
        </h2>

        {/* Selector de frecuencia */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["semanal", "quincenal", "mensual"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => onFrequencySelect(f)}
              className={`flex-1 py-2 px-1 rounded-xl border-2 font-bold text-[10px] uppercase transition-all ${
                store.frequency === f
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-slate-100 text-slate-400 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Inicial y número de cuotas */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Cuota Inicial
            </label>
            <input
              type="text"
              placeholder="0"
              value={
                store.downPayment === 0 ? "" : formatMoney(store.downPayment)
              }
              onInput={onDownPaymentChange}
              className={`w-full mt-1 p-3 bg-slate-50 border rounded-xl outline-none font-bold text-sm focus:ring-2 transition-all text-slate-800 ${
                store.downPayment < 0
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-200 focus:ring-emerald-500"
              }`}
            />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              N° Cuotas
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={store.installments === 0 ? "" : store.installments}
              onChange={onInstallmentsChange}
              className={`w-full mt-1 p-3 bg-slate-50 border rounded-xl outline-none font-bold text-center text-sm focus:ring-2 transition-all text-slate-800 ${
                store.installments <= 0
                  ? "border-red-500 focus:ring-red-500"
                  : "border-slate-200 focus:ring-emerald-500"
              }`}
            />
            <p className="text-[9px] text-slate-400 mt-1 text-center font-bold uppercase tracking-wide">
              {getMaxCuotasTexto()}
            </p>
          </div>
        </div>

        {/* Info Box: Valor de cuota automático (Solo Informativo y calculado por el sistema) */}
        {store.installments > 0 && (
          <div className="p-4 bg-emerald-500 text-white rounded-xl text-center shadow-inner animate-fade-in">
            <p className="text-[10px] font-bold opacity-90 uppercase tracking-widest">
              Valor Calculado de cada Cuota
            </p>
            <p className="text-2xl font-black mt-1">
              ${formatMoney(store.installmentValue)}
            </p>
          </div>
        )}
      </Card>

      {/* Bloque 3: Consola Oscura del Cronograma Proyectado */}
      {store.installments > 0 ? (
        <div className="glass-card p-5 bg-slate-900 text-white shadow-xl space-y-4">
          <div className="border-b border-white/10  flex justify-between items-end">
            <div>
              <p className="font-bold text-blue-400 tracking-wide font-mono text-xs">
                PLAN PROYECTADO
              </p>
              <p className="text-[10px] opacity-60 uppercase font-mono mt-0.5 text-black/80">
                Saldo Neto a Pagar: ${formatMoney(balance)}
              </p>
            </div>
            <span className="text-[10px] font-mono bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md border border-blue-500/30">
              {store.installments} Pg.
            </span>
          </div>

          <div className="text-xs font-mono space-y-1.5 max-h-52 overflow-y-auto pr-1 custom-scrollbar opacity-90">
            {cronograma.map((cuota) => (
              <div
                key={cuota.numero}
                className="flex justify-between items-center py-0.5 border-b border-white/[0.02]"
              >
                <span className="opacity-70 text-black/80">
                  #{cuota.numero.toString().padStart(2, "0")} -{" "}
                  {cuota.fecha.toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
                <span className="text-emerald-400 font-bold">
                  ${formatMoney(cuota.valor)}
                </span>
              </div>
            ))}
          </div>

          <button
            ref={btnCopyRef}
            type="button"
            onClick={handleCopySimulation}
            className="w-full bg-white text-slate-900 font-black py-4 rounded-xl active:scale-[0.98] transition-all uppercase tracking-widest text-xs shadow-lg mt-2"
          >
            Copiar Simulación
          </button>

          <button
            type="button"
            onClick={handleProceedToNewCredit}
            className="w-full bg-slate-800 text-emerald-400 border border-emerald-500/30 font-bold py-3 rounded-xl active:scale-[0.98] transition-all uppercase text-[11px] tracking-wider"
          >
            ➡️ Proceder a Registrar Cliente
          </button>
        </div>
      ) : (
        /* Bloque de Alerta cuando NO se ha completado el plan de pagos */
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
          <span className="text-2xl">⚠️</span>
          <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
            Plan Proyectado Bloqueado
          </p>
          <p className="text-[11px] text-amber-600 font-medium">
            Por favor, defina el número de cuotas (superior a 0) en el plan de
            pagos para generar el cronograma automático del negocio.
          </p>
        </div>
      )}
    </div>
  );
}
