const colors = {
  activo: "bg-emerald-100 text-emerald-700",
  vencido: "bg-red-100 text-red-700",
  pagado: "bg-slate-100 text-slate-500",
  pendiente: "bg-amber-100 text-amber-700",
};

export function Badge({ estado }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
        colors[estado] ?? colors.activo
      }`}
    >
      {estado}
    </span>
  );
}
