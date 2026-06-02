export function Button({
  children,
  onClick,
  variant = "primary",
  loading,
  disabled,
  type = "button",
}) {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`w-full py-3 px-4 rounded-xl font-bold transition-all ${variants[variant]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? "⏳ Cargando..." : children}
    </button>
  );
}
