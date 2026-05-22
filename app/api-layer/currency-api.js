const API_BASE = "https://api.frankfurter.app";
const CACHE_PREFIX = "omniconvert:currency-rate:";
const FALLBACK_RATES_IN_BRL = {
  BRL: 1,
  USD: 5.12,
  EUR: 5.58,
  GBP: 6.54,
  JPY: 0.033,
  CAD: 3.75,
  CHF: 5.74,
  AUD: 3.39
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function cacheKey(from, to) {
  return `${CACHE_PREFIX}${todayKey()}:${from}:${to}`;
}

function readCache(from, to) {
  return JSON.parse(localStorage.getItem(cacheKey(from, to)) || "null");
}

function writeCache(from, to, payload) {
  localStorage.setItem(cacheKey(from, to), JSON.stringify(payload));
}

function fallbackRate(from, to) {
  const fromRate = FALLBACK_RATES_IN_BRL[from];
  const toRate = FALLBACK_RATES_IN_BRL[to];

  if (!fromRate || !toRate) {
    throw new Error("Cotação indisponível para este par de moedas.");
  }

  return fromRate / toRate;
}

export async function getCurrencyRate(from, to) {
  if (from === to) {
    return {
      date: todayKey(),
      provider: "identity",
      rate: 1
    };
  }

  const cached = readCache(from, to);

  if (cached) {
    return { ...cached, provider: `${cached.provider} cache` };
  }

  try {
    const url = `${API_BASE}/latest?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Frankfurter indisponível.");
    }

    const data = await response.json();
    const rate = data.rates?.[to];

    if (!Number.isFinite(rate)) {
      throw new Error("Cotação não encontrada.");
    }

    const payload = {
      date: data.date,
      provider: "Frankfurter",
      rate
    };

    writeCache(from, to, payload);
    return payload;
  } catch (error) {
    return {
      date: todayKey(),
      provider: "fallback local",
      rate: fallbackRate(from, to),
      warning: error.message
    };
  }
}
