import { useEffect } from "react";
import { useCreditStore } from "../store/useCreditStore";
import { Card } from "../components/ui/Card";
import { formatMoney } from "../utils/money";

export default function HomePage({ navigate }) {
  const { creditos, fetchCreditos } = useCreditStore();

  // Cargamos los créditos al montar el componente
  useEffect(() => {
    fetchCreditos();
  }, []);

  // --- MTRICAS Y CÁLCULOS EN TIEMPO REAL ---

  // 1. Filtrar por estados
  const creditosActivos = creditos.filter((c) => c.estado === "activo");
  const creditosPagados = creditos.filter((c) => c.estado === "pagado");

  // 2. Total Invertido (Suma del valor base de todos los artículos financiados)
  const totalInvertido = creditos.reduce(
    (acc, c) => acc + (c.valorBase || 0),
    0,
  );

  // 3. Cartera Activa Pendiente (Lo que falta por recaudar de los créditos vigentes)
  const carteraActiva = creditosActivos.reduce(
    (acc, c) => acc + (c.saldo || 0),
    0,
  );

  // 4. Total Recaudado Histórico (Abonos iniciales + pagos realizados)
  // Nota: En esta fase local, lo calculamos como la diferencia del total financiado menos el saldo actual
  const totalRecaudado = creditos.reduce((acc, c) => {
    const ganadoEnEsteCredito = (c.totalFinanciado || 0) - (c.saldo || 0);
    return acc + ganadoEnEsteCredito;
  }, 0);

  const modules = [
    {
      id: "simulator",
      title: "🟢 Nuevo Crédito",
      description: "Registra un nuevo financiamiento",
      color: "emerald",
    },
    {
      id: "portfolio",
      title: "🟡 Cartera",
      description: "Ver y gestionar clientes",
      color: "amber",
    },
  ];

  return (
    <div className="fade-in space-y-6 pb-12">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
          Inversiones LJ
        </h1>
        <p className="text-sm text-slate-500 font-medium">
          Panel de Control Central
        </p>
      </div>

      {/* Grid de Resumen Contable / Métricas Principales */}
      <div className="space-y-4">
        {/* Cartera Principal */}
        <Card accent="blue" className="text-center py-6">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cartera Activa por Cobrar
          </div>
          <div className="text-4xl font-black text-blue-600 mt-1">
            $ {formatMoney(carteraActiva)}
          </div>
          <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100 flex justify-between px-2">
            <span>Recaudado Histórico:</span>
            <span className="font-semibold text-emerald-600">
              $ {formatMoney(totalRecaudado)}
            </span>
          </div>
        </Card>

        {/* Métricas secundarias en dos columnas */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500">
              Total Invertido
            </span>
            <span className="text-xl font-bold text-slate-800 mt-1">
              $ {formatMoney(totalInvertido)}
            </span>
            <span className="text-[10px] text-slate-400 mt-1">
              Costo base acumulado
            </span>
          </Card>

          <Card className="p-4 flex flex-col justify-between">
            <span className="text-xs font-medium text-slate-500">
              Estado de Créditos
            </span>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-600 font-medium">● Activos:</span>
                <span className="font-bold text-slate-700">
                  {creditosActivos.length}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-medium">✓ Pagados:</span>
                <span className="font-bold text-slate-500">
                  {creditosPagados.length}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Título de Navegación */}
      <div className="pt-2">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
          Accesos Directos
        </h2>

        {/* Grid de módulos adaptado (Removemos el detalle del menú principal ya que se accede desde cartera) */}
        <div className="grid grid-cols-2 gap-3">
          {modules.map((mod) => (
            <Card
              key={mod.id}
              accent={mod.color}
              className="text-center p-4 cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all duration-200 bg-white"
              onClick={() => navigate(mod.id)}
            >
              <div className="space-y-2">
                <div className="text-2xl">{mod.title.split(" ")[0]}</div>
                <div>
                  <h3 className="font-bold text-xs text-slate-800 whitespace-nowrap">
                    {mod.title.split(" ")[1]}
                  </h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Info de Sincronización en el Footer */}
      <div className="text-center text-[11px] text-slate-400 pt-4 flex justify-center items-center gap-1.5">
        <span className="inline-block w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
        Modo de desarrollo local (Datos simulados)
      </div>
    </div>
  );
}
