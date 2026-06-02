import { useEffect, useState } from "react";
import { useCreditStore } from "../store/useCreditStore";
import { formatMoney } from "../utils/money";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { BackButton } from "../components/shared/BackButton";

export default function PortfolioPage({ navigate }) {
  const store = useCreditStore();
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    store.fetchCreditos();
  }, []);

  const creditos = store.creditos || [];

  const creditosFiltrados =
    filtro === "todos"
      ? creditos
      : creditos.filter((c) => (c.O || c.estado) === filtro);

  const stats = {
    total: creditos.reduce((s, c) => s + (c.I || c.totalFinanciado || 0), 0),
    activos: creditos.filter((c) => (c.O || c.estado) !== "pagado").length,
    recaudado: creditos.reduce((s, c) => s + (c.J || c.abonoInicial || 0), 0),
  };

  const handleSelectCredit = (credito) => {
    store.setCreditoActivo(credito);
    navigate("creditDetail");
  };

  return (
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
                onClick={() => handleSelectCredit(credito)}
                className="cursor-pointer space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {credito.C || credito.clienteNombre}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      {credito.F || credito.articuloDescripcion}
                    </p>
                  </div>
                  <Badge estado={estado} />
                </div>

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

                {/* Progress bar simple */}
                <div className="bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${total > 0 ? Math.min((pagado / total) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
