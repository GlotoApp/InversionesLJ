import { useEffect, useState } from "react";
import { useCreditStore } from "../store/useCreditStore";
import { formatMoney, formatDate, isOverdue } from "../utils/money";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { ProgressBar } from "../components/ui/ProgressBar";
import { BackButton } from "../components/shared/BackButton";

export default function CreditDetailPage({ navigate }) {
  const store = useCreditStore();
  const credito = store.creditoActivo;
  const cronograma = store.cronograma || [];
  const pagos = store.pagos || [];

  const [montoPago, setMontoPago] = useState("");
  const [notaPago, setNotaPago] = useState("");

  useEffect(() => {
    if (credito) {
      store.fetchDetalle(credito.A || credito.id);
    }
  }, [credito]);

  if (!credito) {
    return (
      <div className="fade-in space-y-4">
        <BackButton onClick={() => navigate("portfolio")} />
        <Card className="text-center py-8">
          <p className="text-slate-600">No hay crédito seleccionado</p>
          <Button onClick={() => navigate("portfolio")} variant="ghost">
            Volver a Cartera
          </Button>
        </Card>
      </div>
    );
  }

  const creditoId = credito.A || credito.id;
  const estado = credito.O || credito.estado || "activo";
  const total = credito.I || credito.totalFinanciado || 0;
  const saldo = credito.K || credito.saldo || 0;
  const pagado = total - saldo;

  const handleRegistrarPago = async (e) => {
    e.preventDefault();

    const monto = parseInt(montoPago.replace(/\D/g, "")) || 0;
    if (monto <= 0) {
      alert("Ingresa un monto válido");
      return;
    }

    try {
      await store.registrarPago(creditoId, monto, notaPago);
      alert("✓ Pago registrado exitosamente");
      setMontoPago("");
      setNotaPago("");
      store.fetchDetalle(creditoId);
    } catch (e) {
      alert("Error al registrar pago: " + e.message);
    }
  };

  const cuotasPagadas = cronograma.filter(
    (c) => c.E === true || c.pagado === true,
  ).length;
  const cuotasVencidas = cronograma.filter(
    (c) =>
      (c.E === false || c.pagado === false) &&
      isOverdue(c.C || c.fechaVencimiento, false),
  ).length;

  return (
    <div className="fade-in space-y-4 pb-32">
      <BackButton onClick={() => navigate("portfolio")} />

      <h1 className="text-2xl font-bold text-slate-800">
        🔴 Detalle del Crédito
      </h1>

      {/* Info del Cliente */}
      <Card accent="blue" className="space-y-3">
        <h2 className="font-bold text-slate-800">👤 Cliente</h2>
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-slate-600">Nombre:</span>
            <div className="font-bold">
              {credito.C || credito.clienteNombre}
            </div>
          </div>
          {(credito.D || credito.clienteTelefono) && (
            <div>
              <span className="text-slate-600">Teléfono:</span>
              <div className="font-bold">
                {credito.D || credito.clienteTelefono}
              </div>
            </div>
          )}
          {(credito.E || credito.clienteDocumento) && (
            <div>
              <span className="text-slate-600">Documento:</span>
              <div className="font-bold">
                {credito.E || credito.clienteDocumento}
              </div>
            </div>
          )}
          <div className="border-t border-blue-200 pt-2">
            <span className="text-slate-600">Artículo:</span>
            <div className="font-bold">
              {credito.F || credito.articuloDescripcion}
            </div>
          </div>
        </div>
      </Card>

      {/* Estado del Crédito */}
      <Card accent="emerald" className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-slate-800">💰 Estado</h2>
          <Badge estado={estado} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-slate-600 text-xs">Total Financiado</div>
            <div className="font-bold text-lg">${formatMoney(total)}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-slate-600 text-xs">Saldo Pendiente</div>
            <div className="font-bold text-lg text-red-600">
              ${formatMoney(saldo)}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-slate-600 text-xs">Abono Inicial</div>
            <div className="font-bold text-lg">
              ${formatMoney(credito.J || credito.abonoInicial || 0)}
            </div>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="text-slate-600 text-xs">Pagado</div>
            <div className="font-bold text-lg text-emerald-600">
              ${formatMoney(pagado)}
            </div>
          </div>
        </div>

        {/* Progress */}
        <ProgressBar
          value={pagado}
          max={total}
          label={`Progreso: ${Math.round((pagado / total) * 100)}%`}
        />
      </Card>

      {/* Resumen de Cuotas */}
      <Card accent="amber" className="space-y-3">
        <h2 className="font-bold text-slate-800">📋 Resumen de Cuotas</h2>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="bg-emerald-50 p-3 rounded-lg">
            <div className="text-xs text-slate-600">Pagadas</div>
            <div className="font-bold text-lg text-emerald-600">
              {cuotasPagadas}
            </div>
          </div>
          <div className="bg-amber-50 p-3 rounded-lg">
            <div className="text-xs text-slate-600">Pendientes</div>
            <div className="font-bold text-lg">
              {
                cronograma.filter((c) => c.E === false || c.pagado === false)
                  .length
              }
            </div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-xs text-slate-600">Vencidas</div>
            <div className="font-bold text-lg text-red-600">
              {cuotasVencidas}
            </div>
          </div>
        </div>
      </Card>

      {/* Cronograma */}
      {cronograma.length > 0 && (
        <Card accent="red" className="space-y-3">
          <h2 className="font-bold text-slate-800">📅 Cronograma</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {cronograma.map((cuota, idx) => {
              const pag = cuota.E === true || cuota.pagado === true;
              const vencida =
                !pag && isOverdue(cuota.C || cuota.fechaVencimiento, false);

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-lg flex justify-between items-center text-sm ${
                    pag
                      ? "bg-emerald-50 border-l-4 border-emerald-500"
                      : vencida
                        ? "bg-red-50 border-l-4 border-red-500"
                        : "bg-slate-50 border-l-4 border-amber-500"
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">
                      Cuota {cuota.B || cuota.numeroCuota} {pag && "✓"}
                      {vencida && "⚠️"}
                    </div>
                    <div className="text-xs text-slate-600">
                      {formatDate(cuota.C || cuota.fechaVencimiento)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      ${formatMoney(cuota.D || cuota.valorCuota || 0)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Registrar Pago */}
      {saldo > 0 && estado !== "pagado" && (
        <Card accent="emerald" className="space-y-4">
          <h2 className="font-bold text-slate-800">💵 Registrar Pago</h2>
          <form onSubmit={handleRegistrarPago} className="space-y-4">
            <Input
              label="Monto del Pago ($) *"
              type="number"
              value={montoPago}
              onChange={setMontoPago}
              placeholder="100000"
              required
            />

            <Input
              label="Nota (opcional)"
              value={notaPago}
              onChange={setNotaPago}
              placeholder="Efectivo, transferencia, cheque, etc."
            />

            <Button type="submit" variant="success">
              ✓ Registrar Pago
            </Button>
          </form>
        </Card>
      )}

      {/* Historial de Pagos */}
      {pagos.length > 0 && (
        <Card className="space-y-3">
          <h2 className="font-bold text-slate-800">📊 Historial de Pagos</h2>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pagos.map((pago, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-50 rounded-lg flex justify-between items-center text-sm"
              >
                <div>
                  <div className="text-xs text-slate-600">
                    {formatDate(pago.B || pago.fecha)}
                  </div>
                  {(pago.D || pago.nota) && (
                    <div className="text-xs text-slate-600">
                      {pago.D || pago.nota}
                    </div>
                  )}
                </div>
                <div className="font-bold text-emerald-600">
                  +${formatMoney(pago.C || pago.monto || 0)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
