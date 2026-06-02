export const formatMoney = (n) => {
  if (isNaN(n) || n === null) return "0";
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const parseMoney = (v) => {
  if (!v) return 0;
  return parseInt(v.toString().replace(/\D/g, "")) || 0;
};

export const formatDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") {
    return date.split("T")[0];
  }
  return new Date(date).toISOString().split("T")[0];
};

export const isOverdue = (dueDate, paid) => {
  if (paid) return false;
  const today = new Date();
  const due = new Date(dueDate);
  return due < today;
};
