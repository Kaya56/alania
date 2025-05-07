export function formatRelativeDate(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd’hui";
  if (diff === 1) return "Hier";
  if (diff < 7) return `Il y a ${diff} jours`;
  if (diff < 30) return `Il y a ${Math.ceil(diff / 7)} semaines`;
  return `Il y a ${Math.ceil(diff / 30)} mois`;
}