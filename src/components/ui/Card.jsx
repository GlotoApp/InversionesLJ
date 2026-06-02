export function Card({ children, className = "", accent, onClick }) {
  const accentClass = accent ? `border-b-4 border-${accent}-500` : "";
  const clickable = onClick
    ? "cursor-pointer hover:shadow-lg transition-shadow"
    : "";
  return (
    <div
      onClick={onClick}
      className={`glass-card p-5 ${accentClass} ${clickable} ${className}`}
    >
      {children}
    </div>
  );
}
