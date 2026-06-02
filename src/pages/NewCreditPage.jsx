import { useState } from "react";
import { useSimulatorStore } from "../store/useSimulatorStore";
import { useCreditStore } from "../store/useCreditStore";
import { formatMoney } from "../utils/money";
import { Card } from "../components/ui/Card";
import { BackButton } from "../components/shared/BackButton";

export default function NewCreditPage({ navigate }) {
  const simulator = useSimulatorStore();
  const creditStore = useCreditStore();

  const [form, setForm] = useState({
    // Datos de simulación (precargados)
    productName: simulator.productName || "",
    baseValue: simulator.baseValue || 0,
    totalValue: simulator.totalValue || 0,
    downPayment: simulator.downPayment || 0,
    installments: simulator.installments || 0,
    frequency: simulator.frequency || "semanal",

    // Datos del cliente
    fullName: "",
    cedula: "",
    birthDate: "",
    cedulaExpeditionDate: "",
    residence: "",
    whatsapp: "",
    email: "",
    cedulaFront: null,
    cedulaBack: null,
    residenceReceipt: null,
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (key, file) => {
    setForm((prev) => ({ ...prev, [key]: file }));
  };

  const validateForm = () => {
    const errors = [];

    // Validar datos del cliente
    if (!form.fullName || form.fullName.trim() === "") {
      errors.push("Nombre y Apellidos Completos");
    }
    if (!form.cedula || form.cedula.trim() === "") {
      errors.push("Número de Cédula");
    }
    if (!form.birthDate) {
      errors.push("Fecha de Nacimiento");
    }
    if (!form.cedulaExpeditionDate) {
      errors.push("Fecha de Expedición de Cédula");
    }
    if (!form.residence || form.residence.trim() === "") {
      errors.push("Lugar de Residencia");
    }
    if (!form.whatsapp || form.whatsapp.trim() === "") {
      errors.push("Número de WhatsApp");
    }
    if (!form.email || form.email.trim() === "") {
      errors.push("Correo Electrónico");
    }
    if (!form.cedulaFront) {
      errors.push("Foto Cédula (Frente)");
    }
    if (!form.cedulaBack) {
      errors.push("Foto Cédula (Reverso)");
    }
    if (!form.residenceReceipt) {
      errors.push("Recibo de Residencia");
    }

    // Validar datos de simulación
    if (!form.productName) {
      errors.push("Nombre del Producto");
    }
    if (form.baseValue <= 0) {
      errors.push("Valor Base");
    }
    if (form.installments <= 0) {
      errors.push("Número de Cuotas");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      alert(
        `⚠️ Por favor, completa todos los campos:\n\n❌ ${errors.join("\n❌ ")}`,
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const credito = {
      clienteNombre: form.fullName,
      clienteTelefono: form.whatsapp,
      clienteDocumento: form.cedula,
      clienteEmail: form.email,
      clienteFechaNacimiento: form.birthDate,
      clienteFechaExpedicion: form.cedulaExpeditionDate,
      clienteResidencia: form.residence,
      articuloDescripcion: form.productName,
      valorBase: form.baseValue,
      porcentaje: simulator.percent,
      totalFinanciado: form.totalValue,
      abonoInicial: form.downPayment,
      saldo: form.totalValue - form.downPayment,
      numeroCuotas: form.installments,
      valorCuota: simulator.installmentValue,
      frecuencia: form.frequency,
      estado: "activo",
    };

    try {
      await creditStore.guardarCredito(credito);
      alert("✓ Crédito guardado exitosamente");
      navigate("home");
    } catch (error) {
      alert("❌ Error al guardar: " + error.message);
    }
  };

  const balance = form.totalValue - form.downPayment;

  return (
    <div className="fade-in space-y-5 pb-12">
      <BackButton onClick={() => navigate("simulator")} />

      {/* Resumen de Simulación */}
      <Card accent="blue" className="p-4">
        <h3 className="text-xs font-bold text-slate-600 uppercase mb-3">
          📊 Datos de Simulación
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Producto:</span>
            <span className="font-bold text-slate-800">{form.productName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Total Financiar:</span>
            <span className="font-bold text-blue-600">
              ${formatMoney(form.totalValue)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Cuota Inicial:</span>
            <span className="font-bold text-slate-800">
              ${formatMoney(form.downPayment)}
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-slate-600 font-semibold">Saldo a Pagar:</span>
            <span className="font-black text-emerald-600">
              ${formatMoney(balance)}
            </span>
          </div>
        </div>
      </Card>

      {/* Formulario de Datos del Cliente */}
      <form onSubmit={handleSubmit}>
        <Card className="space-y-5">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-3">
            👤 Datos del Cliente
          </h2>

          {/* Nombre y Apellidos */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nombre y Apellidos Completos
            </label>
            <input
              type="text"
              placeholder="Ej. Juan Carlos Pérez García"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
            />
          </div>

          {/* Cédula */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Número de Cédula
            </label>
            <input
              type="text"
              placeholder="Ej. 1234567890"
              value={form.cedula}
              onChange={(e) => handleChange("cedula", e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
            />
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Fecha de Nacimiento
              </label>
              <input
                type="date"
                value={form.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Expedición Cédula
              </label>
              <input
                type="date"
                value={form.cedulaExpeditionDate}
                onChange={(e) =>
                  handleChange("cedulaExpeditionDate", e.target.value)
                }
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Residencia */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Lugar de Residencia
            </label>
            <input
              type="text"
              placeholder="Ej. Calle 5 # 10-20, Apt 302"
              value={form.residence}
              onChange={(e) => handleChange("residence", e.target.value)}
              className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
            />
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                WhatsApp
              </label>
              <input
                type="tel"
                placeholder="Ej. 3001234567"
                value={form.whatsapp}
                onChange={(e) => handleChange("whatsapp", e.target.value)}
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all text-slate-800"
              />
            </div>
          </div>
        </Card>

        {/* Sección de Documentos */}
        <Card className="space-y-4 border-t-4 border-amber-500 mt-5">
          <h2 className="text-lg font-bold text-slate-800 border-b pb-3">
            📄 Documentos Requeridos
          </h2>

          {/* Foto Cédula Frente */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              📸 Foto Cédula - Frente
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange("cedulaFront", e.target.files?.[0])
              }
              className="w-full p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer text-sm text-slate-600 focus:outline-none"
            />
            {form.cedulaFront && (
              <p className="text-xs text-emerald-600 mt-1 font-semibold">
                ✓ {form.cedulaFront.name}
              </p>
            )}
          </div>

          {/* Foto Cédula Reverso */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              📸 Foto Cédula - Reverso
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleFileChange("cedulaBack", e.target.files?.[0])
              }
              className="w-full p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer text-sm text-slate-600 focus:outline-none"
            />
            {form.cedulaBack && (
              <p className="text-xs text-emerald-600 mt-1 font-semibold">
                ✓ {form.cedulaBack.name}
              </p>
            )}
          </div>

          {/* Recibo de Residencia */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              📄 Recibo de Residencia (Luz, Agua, etc.)
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) =>
                handleFileChange("residenceReceipt", e.target.files?.[0])
              }
              className="w-full p-3 bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer text-sm text-slate-600 focus:outline-none"
            />
            {form.residenceReceipt && (
              <p className="text-xs text-emerald-600 mt-1 font-semibold">
                ✓ {form.residenceReceipt.name}
              </p>
            )}
          </div>
        </Card>

        {/* Botones de Acción */}
        <div className="space-y-3 mt-5">
          <button
            type="submit"
            className="w-full bg-emerald-500 text-white font-black py-4 rounded-xl active:scale-[0.98] transition-all uppercase tracking-widest text-sm shadow-lg"
          >
            ✓ Guardar Crédito
          </button>
          <button
            type="button"
            onClick={() => navigate("simulator")}
            className="w-full bg-slate-200 text-slate-800 font-bold py-3 rounded-xl active:scale-[0.98] transition-all uppercase text-xs"
          >
            ← Volver a Simulación
          </button>
        </div>
      </form>
    </div>
  );
}
