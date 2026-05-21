const FREE_DAILY_LIMIT = 12;
const HISTORY_LIMIT = 20;

const todayKey = () => new Date().toISOString().slice(0, 10);

function accountKey(session) {
  return session?.email || "preview@omniconvert.local";
}

function storageKey(session, name) {
  return `omniconvert:${accountKey(session)}:${name}`;
}

export function getSession() {
  return JSON.parse(localStorage.getItem("omni-session") || "null") || {
    email: "preview@omniconvert.local",
    id: "preview"
  };
}

export function getPlan(session) {
  return localStorage.getItem(storageKey(session, "plan")) || "Free";
}

export function setPlan(session, plan) {
  localStorage.setItem(storageKey(session, "plan"), plan);
}

export function getUsage(session) {
  const stored = JSON.parse(localStorage.getItem(storageKey(session, "usage")) || "null");

  if (!stored || stored.date !== todayKey()) {
    return { date: todayKey(), count: 0 };
  }

  return stored;
}

export function canConvert(session) {
  if (getPlan(session) === "Plus") return true;
  return getUsage(session).count < FREE_DAILY_LIMIT;
}

export function incrementUsage(session) {
  if (getPlan(session) === "Plus") return getUsage(session);
  const usage = getUsage(session);
  const next = { ...usage, count: usage.count + 1 };
  localStorage.setItem(storageKey(session, "usage"), JSON.stringify(next));
  return next;
}

export function usageSummary(session) {
  const plan = getPlan(session);
  const usage = getUsage(session);
  const remaining = plan === "Plus" ? "∞" : Math.max(FREE_DAILY_LIMIT - usage.count, 0);

  return { plan, usage, limit: FREE_DAILY_LIMIT, remaining };
}

export function getHistory(session) {
  return JSON.parse(localStorage.getItem(storageKey(session, "history")) || "[]");
}

export function saveHistory(session, item) {
  const plan = getPlan(session);
  const history = [item, ...getHistory(session)];
  const next = plan === "Plus" ? history : history.slice(0, HISTORY_LIMIT);
  localStorage.setItem(storageKey(session, "history"), JSON.stringify(next));
  return next;
}

export function clearHistory(session) {
  localStorage.removeItem(storageKey(session, "history"));
}

export function getFavorites(session) {
  return JSON.parse(localStorage.getItem(storageKey(session, "favorites")) || "[]");
}

export function toggleFavorite(session, item) {
  const favorites = getFavorites(session);
  const exists = favorites.some((favorite) => favorite.signature === item.signature);
  const next = exists
    ? favorites.filter((favorite) => favorite.signature !== item.signature)
    : [item, ...favorites];

  localStorage.setItem(storageKey(session, "favorites"), JSON.stringify(next));
  return next;
}

export function topCategory(history) {
  const counts = history.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "--";
}

export function logout() {
  localStorage.removeItem("omni-session");
  window.location.href = "/";
}
