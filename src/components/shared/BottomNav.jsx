export function BottomNav({ currentPage, onNavigate }) {
  const pages = [
    { id: "home", label: "🏠 Inicio", icon: "🏠" },
    { id: "simulator", label: "🔵 Simulador", icon: "🔵" },
    { id: "newCredit", label: "🟢 Nuevo", icon: "🟢" },
    { id: "portfolio", label: "🟡 Cartera", icon: "🟡" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 max-w-md mx-auto">
      <div className="grid grid-cols-4 gap-2">
        {pages.map((page) => (
          <button
            key={page.id}
            onClick={() => onNavigate(page.id)}
            className={`py-3 px-2 rounded-lg text-center text-sm font-semibold transition-colors ${
              currentPage === page.id
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <div className="text-xl mb-1">{page.icon}</div>
            <div className="text-xs">{page.label.split(" ")[1]}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
