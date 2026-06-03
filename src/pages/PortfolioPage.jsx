import { useEffect, useState } from "react";
import { useCreditStore } from "../store/useCreditStore";
import { formatMoney } from "../utils/money";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { BackButton } from "../components/shared/BackButton";

// Helper: read file as base64
const leerArchivoBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export default function PortfolioPage({ navigate }) {
  const store = useCreditStore();
  const [filtro, setFiltro] = useState("todos");
  const [expandido, setExpandido] = useState(null);
  const [mensajeNotif, setMensajeNotif] = useState("");
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  useEffect(() => {
    store.fetchCreditos();
  }, []);

  const creditos = store.creditos || [];

  const creditosFiltrados =
    filtro === "todos"
      ? creditos
      : creditos.filter((c) => {
          const estado = c.O || c.estado || "activo";
          return estado === filtro;
        });

  const stats = {
    total: creditos.reduce((s, c) => s + (c.I || c.totalFinanciado || 0), 0),
    activos: creditos.filter((c) => {
      const estado = c.O || c.estado || "activo";
      return estado !== "pagado";
    }).length,
    recaudado: creditos.reduce((s, c) => s + (c.J || c.abonoInicial || 0), 0),
  };

  const handleSelectCredit = (credito) => {
    store.setCreditoActivo(credito);
    navigate("creditDetail");
  };

  // Generar URL de WhatsApp
  const generarURLWhatsApp = (credito, tipoNotif) => {
    const telefono = (credito.D || "").replace(/\D/g, "");
    if (!telefono) return null;

    let mensaje = "";
    const nombreCliente = credito.C || "Cliente";
    const articulo = credito.F || "artículo";
    const saldo = credito.K || credito.saldo || 0;

    switch (tipoNotif) {
      case "cuota_vencida":
        mensaje = `Hola ${nombreCliente}, le informamos que tiene una *cuota vencida* por pagar de *$${formatMoney(saldo)}* correspondiente a su ${articulo}. Por favor, regularice su pago lo antes posible. ¡Gracias!`;
        break;
      case "cuota_pagada":
        mensaje = `¡Excelente! ${nombreCliente}, confirmamos que su cuota ha sido *pagada exitosamente*. Saldo restante: *$${formatMoney(saldo)}*. ¡Gracias por su puntualidad!`;
        break;
      case "mora":
        const diasMora = Math.floor(
          (Date.now() - new Date(credito.fechaVencimiento).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        mensaje = `⚠️ Hola ${nombreCliente}, su cuota se encuentra en *mora de ${diasMora} días*. Saldo pendiente: *$${formatMoney(saldo)}*. Por favor, realice el pago cuanto antes. Disponemos de diferentes formas de pago para su conveniencia.`;
        break;
      default:
        mensaje = `Hola ${nombreCliente}, le contamos sobre su ${articulo}.`;
    }

    return `https://wa.me/57${telefono}?text=${encodeURIComponent(mensaje)}`;
  };

  // Generar URL de correo
  const generarURLCorreo = (credito, tipoNotif) => {
    const correo = credito.email || "";
    if (!correo) return null;

    let asunto = "";
    let cuerpo = "";
    const nombreCliente = credito.C || "Cliente";
    const articulo = credito.F || "artículo";
    const saldo = credito.K || credito.saldo || 0;

    switch (tipoNotif) {
      case "cuota_vencida":
        asunto = "⚠️ Cuota Vencida - Acción Requerida";
        cuerpo = `Estimado ${nombreCliente},\n\nLe informamos que tiene una cuota vencida por pagar de $${formatMoney(saldo)} correspondiente a su ${articulo}.\n\nPor favor, regularice su pago lo antes posible.\n\n¡Gracias!`;
        break;
      case "cuota_pagada":
        asunto = "✅ Pago Confirmado Exitosamente";
        cuerpo = `Estimado ${nombreCliente},\n\nConfirmamos que su cuota ha sido pagada exitosamente.\nSaldo restante: $${formatMoney(saldo)}\n\n¡Gracias por su puntualidad!`;
        break;
      case "mora":
        const diasMora = Math.floor(
          (Date.now() - new Date(credito.fechaVencimiento).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        asunto = "Mora en Cuota - Acción Urgente";
        cuerpo = `Estimado ${nombreCliente},\n\nSu cuota se encuentra en mora de ${diasMora} días.\nSaldo pendiente: $${formatMoney(saldo)}\n\nPor favor, realice el pago cuanto antes.\n\nDisponemos de diferentes formas de pago para su conveniencia.`;
        break;
      default:
        asunto = "Información de su Crédito";
        cuerpo = `Estimado ${nombreCliente},\n\nLe contamos sobre su ${articulo}.`;
    }

    return `mailto:${correo}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
  };

  const toggleExpanded = (id) => {
    setExpandido(expandido === id ? null : id);
  };

  const handleSubirFoto = async (creditoId, campo, e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await leerArchivoBase64(file);
      store.guardarFotoCredito(creditoId, campo, base64);
    } catch (err) {
      console.error("Error al leer imagen:", err);
    }
  };

  return (
    <>
      <div className="fade-in space-y-4 pb-32">
        <BackButton onClick={() => navigate("home")} />

        <h1 className="text-2xl font-bold text-slate-800">🟡 Cartera</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="text-center space-y-1">
            <div className="text-xs text-slate-600">Total</div>
            <div className="text-xl font-bold text-blue-600">
              ${formatMoney(stats.total)}
            </div>
          </Card>
          <Card className="text-center space-y-1">
            <div className="text-xs text-slate-600">Activos</div>
            <div className="text-xl font-bold text-emerald-600">
              {stats.activos}
            </div>
          </Card>
          <Card className="text-center space-y-1">
            <div className="text-xs text-slate-600">Recaudado</div>
            <div className="text-xl font-bold text-amber-600">
              ${formatMoney(stats.recaudado)}
            </div>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {["todos", "activo", "pagado", "vencido"].map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
                filtro === f
                  ? "bg-amber-500 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Lista de Créditos */}
        {store.loading ? (
          <Card className="text-center py-8">
            <p className="text-slate-600">⏳ Cargando créditos...</p>
          </Card>
        ) : store.error ? (
          <Card className="text-center py-8 bg-red-50">
            <p className="text-red-600 text-sm">{store.error}</p>
            <button
              onClick={() => store.fetchCreditos()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
            >
              🔄 Reintentar
            </button>
          </Card>
        ) : creditosFiltrados.length === 0 ? (
          <Card className="text-center py-8 bg-slate-50">
            <p className="text-slate-600">No hay créditos en esta categoría</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {creditosFiltrados.map((credito, idx) => {
              const estado = credito.O || credito.estado || "activo";
              const saldo = credito.K || credito.saldo || 0;
              const total = credito.I || credito.totalFinanciado || 0;
              const pagado = total - saldo;
              const isExpanded = expandido === idx;

              return (
                <Card
                  key={idx}
                  accent={
                    estado === "pagado"
                      ? "slate"
                      : estado === "vencido"
                        ? "red"
                        : "emerald"
                  }
                  className="space-y-3"
                >
                  {/* Header - Clickeable */}
                  <div
                    onClick={() => toggleExpanded(idx)}
                    className="cursor-pointer flex justify-between items-start"
                  >
                    <div>
                      <h3 className="font-bold text-slate-800">
                        {credito.C || credito.clienteNombre}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1">
                        {credito.F || credito.articuloDescripcion}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge estado={estado} />
                      <span className="text-lg text-slate-400">
                        {isExpanded ? "▼" : "▶"}
                      </span>
                    </div>
                  </div>

                  {/* Resumen - siempre visible */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-600">Total</span>
                      <div className="font-bold text-slate-800">
                        ${formatMoney(total)}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">Saldo</span>
                      <div className="font-bold text-slate-800">
                        ${formatMoney(saldo)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${total > 0 ? Math.min((pagado / total) * 100, 100) : 0}%`,
                      }}
                    />
                  </div>

                  {/* Detalles expandibles */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 pt-4 space-y-4 animate-fade-in">
                      {/* Info del Cliente */}
                      <div className="space-y-2 text-sm">
                        <h4 className="font-bold text-slate-700">
                          📋 Detalles
                        </h4>
                        {credito.D && (
                          <div>
                            <span className="text-slate-600 text-xs">
                              Teléfono:
                            </span>
                            <div className="font-semibold text-slate-800">
                              {credito.D}
                            </div>
                          </div>
                        )}
                        {credito.E && (
                          <div>
                            <span className="text-slate-600 text-xs">
                              Documento:
                            </span>
                            <div className="font-semibold text-slate-800">
                              {credito.E}
                            </div>
                          </div>
                        )}
                        {credito.email && (
                          <div>
                            <span className="text-slate-600 text-xs">
                              Correo:
                            </span>
                            <div className="font-semibold text-slate-800 truncate">
                              {credito.email}
                            </div>
                          </div>
                        )}
                        <div>
                          <span className="text-slate-600 text-xs">
                            Abono Inicial:
                          </span>
                          <div className="font-semibold text-slate-800">
                            $
                            {formatMoney(
                              credito.J || credito.abonoInicial || 0,
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Documentos / Fotos */}
                      <div className="border-t border-slate-200 pt-4 space-y-3">
                        <h4 className="font-bold text-slate-700 text-sm">
                          🪪 Documentos
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Cédula Frontal */}
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 font-medium">
                              Cédula Frontal
                            </p>
                            {credito.cedulaFrontal ? (
                              <div className="relative group">
                                <img
                                  src={credito.cedulaFrontal}
                                  alt="Cédula frontal"
                                  onClick={() =>
                                    setImagenAmpliada(credito.cedulaFrontal)
                                  }
                                  className="w-full h-24 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                                />
                                <label className="absolute bottom-1 right-1 bg-white/90 rounded-md px-1.5 py-0.5 text-xs text-slate-600 cursor-pointer hover:bg-white border border-slate-200">
                                  ✏️
                                  <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleSubirFoto(
                                        credito.id,
                                        "cedulaFrontal",
                                        e,
                                      )
                                    }
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                                <span className="text-2xl">📷</span>
                                <span className="text-xs text-slate-400 mt-1">
                                  Subir foto
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleSubirFoto(
                                      credito.id,
                                      "cedulaFrontal",
                                      e,
                                    )
                                  }
                                />
                              </label>
                            )}
                          </div>

                          {/* Cédula Trasera */}
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 font-medium">
                              Cédula Trasera
                            </p>
                            {credito.cedulaTrasera ? (
                              <div className="relative group">
                                <img
                                  src={credito.cedulaTrasera}
                                  alt="Cédula trasera"
                                  onClick={() =>
                                    setImagenAmpliada(credito.cedulaTrasera)
                                  }
                                  className="w-full h-24 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                                />
                                <label className="absolute bottom-1 right-1 bg-white/90 rounded-md px-1.5 py-0.5 text-xs text-slate-600 cursor-pointer hover:bg-white border border-slate-200">
                                  ✏️
                                  <input
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={(e) =>
                                      handleSubirFoto(
                                        credito.id,
                                        "cedulaTrasera",
                                        e,
                                      )
                                    }
                                  />
                                </label>
                              </div>
                            ) : (
                              <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                                <span className="text-2xl">📷</span>
                                <span className="text-xs text-slate-400 mt-1">
                                  Subir foto
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleSubirFoto(
                                      credito.id,
                                      "cedulaTrasera",
                                      e,
                                    )
                                  }
                                />
                              </label>
                            )}
                          </div>
                        </div>

                        {/* Recibo */}
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500 font-medium">
                            Foto Recibo
                          </p>
                          {credito.fotoRecibo ? (
                            <div className="relative">
                              <img
                                src={credito.fotoRecibo}
                                alt="Recibo"
                                onClick={() =>
                                  setImagenAmpliada(credito.fotoRecibo)
                                }
                                className="w-full h-32 object-cover rounded-lg border border-slate-200 cursor-pointer hover:opacity-80 transition-opacity"
                              />
                              <label className="absolute bottom-2 right-2 bg-white/90 rounded-md px-2 py-1 text-xs text-slate-600 cursor-pointer hover:bg-white border border-slate-200">
                                ✏️ Cambiar
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleSubirFoto(credito.id, "fotoRecibo", e)
                                  }
                                />
                              </label>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-colors">
                              <span className="text-3xl">🧾</span>
                              <span className="text-xs text-slate-400 mt-1">
                                Subir foto del recibo
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="hidden"
                                onChange={(e) =>
                                  handleSubirFoto(credito.id, "fotoRecibo", e)
                                }
                              />
                            </label>
                          )}
                        </div>
                      </div>

                      {/* Botones de Notificación */}
                      <div className="border-t border-slate-200 pt-3 space-y-2">
                        <h4 className="font-bold text-slate-700 text-sm">
                          📤 Enviar Notificación
                        </h4>

                        {/* Tipo de notificación */}
                        <select
                          value={mensajeNotif}
                          onChange={(e) => setMensajeNotif(e.target.value)}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">
                            Selecciona tipo de notificación...
                          </option>
                          <option value="cuota_vencida">
                            ⚠️ Cuota Vencida
                          </option>
                          <option value="cuota_pagada">✅ Cuota Pagada</option>
                          <option value="mora">🚨 Mora</option>
                        </select>

                        {/* Botones de contacto */}
                        <div className="grid grid-cols-3 gap-2">
                          {/* WhatsApp */}
                          {credito.D && mensajeNotif && (
                            <a
                              href={generarURLWhatsApp(credito, mensajeNotif)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg text-xs text-center transition-colors"
                            >
                              💬 WhatsApp
                            </a>
                          )}

                          {/* Email */}
                          {credito.email && mensajeNotif && (
                            <a
                              href={generarURLCorreo(credito, mensajeNotif)}
                              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-3 rounded-lg text-xs text-center transition-colors"
                            >
                              📧 Email
                            </a>
                          )}

                          {/* Contacto directo */}
                          <button
                            onClick={() => {
                              const telefono = (credito.D || "").replace(
                                /\D/g,
                                "",
                              );
                              if (telefono) {
                                window.location.href = `tel:${telefono}`;
                              } else {
                                alert("No hay teléfono disponible");
                              }
                            }}
                            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-3 rounded-lg text-xs text-center transition-colors"
                          >
                            ☎️ Llamar
                          </button>
                        </div>
                      </div>

                      {/* Botón ver detalle completo */}
                      <button
                        onClick={() => handleSelectCredit(credito)}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 rounded-lg text-sm transition-colors"
                      >
                        Ver Detalle Completo →
                      </button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal imagen ampliada */}
      {imagenAmpliada && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setImagenAmpliada(null)}
        >
          <div className="relative max-w-lg w-full">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setImagenAmpliada(null);
              }}
              className="absolute -top-10 right-0 text-white text-3xl font-bold leading-none"
            >
              ✕
            </button>
            <img
              src={imagenAmpliada}
              alt="Documento ampliado"
              className="w-full rounded-xl shadow-2xl object-contain max-h-[80vh]"
            />
          </div>
        </div>
      )}
    </>
  );
}
