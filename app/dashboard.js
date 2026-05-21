import { categories, convert, findCategory, searchableText } from "./conversion-engine.js";
import {
  canConvert,
  clearHistory,
  getFavorites,
  getHistory,
  getPlan,
  getSession,
  incrementUsage,
  logout,
  saveHistory,
  setPlan,
  toggleFavorite,
  topCategory,
  usageSummary
} from "./state.js";

const session = getSession();
let activeCategoryId = "length";
let lastConversion = null;

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const elements = {
  email: $("[data-user-email]"),
  tabs: $("[data-tabs]"),
  search: $("[data-search]"),
  value: $("[data-input-value]"),
  from: $("[data-from-unit]"),
  to: $("[data-to-unit]"),
  result: $("[data-result]"),
  detail: $("[data-result-detail]"),
  activeCategory: $("[data-active-category]"),
  historyBody: $("[data-history-body]"),
  favorites: $("[data-favorites-list]"),
  quick: $("[data-quick-actions]"),
  modal: $("[data-upgrade-modal]"),
  toast: $(".toast")
};

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2400);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function currentCategory() {
  return findCategory(activeCategoryId);
}

function fillUnits() {
  const category = currentCategory();
  const options = category.unitList.map((unit) => `<option value="${unit}">${unit}</option>`).join("");
  elements.from.innerHTML = options;
  elements.to.innerHTML = options;
  elements.to.selectedIndex = Math.min(1, category.unitList.length - 1);
  elements.activeCategory.textContent = category.name;
}

function renderTabs(filter = "") {
  const query = filter.trim().toLowerCase();
  const filtered = categories.filter((category) => searchableText(category).includes(query));

  elements.tabs.innerHTML = filtered.map((category) => `
    <button class="tab-btn ${category.id === activeCategoryId ? "is-active" : ""}" type="button" data-tab="${category.id}">
      <span>${category.group}</span>
      ${category.name}
    </button>
  `).join("");

  if (!filtered.some((category) => category.id === activeCategoryId) && filtered[0]) {
    activeCategoryId = filtered[0].id;
    fillUnits();
  }
}

function renderMetrics() {
  const history = getHistory(session);
  const summary = usageSummary(session);
  const last = history[0];

  elements.email.textContent = session.email;
  $("[data-plan-label]").textContent = summary.plan;
  $("[data-usage-ring]").textContent = summary.plan === "Plus" ? "∞" : `${summary.usage.count}/${summary.limit}`;
  $("[data-usage-copy]").textContent = summary.plan === "Plus"
    ? "Conversões ilimitadas ativas no NeonGate Plus."
    : `${summary.remaining} conversões restantes hoje no plano Free.`;
  $("[data-metric-today]").textContent = summary.usage.count;
  $("[data-metric-remaining]").textContent = summary.remaining;
  $("[data-metric-plan]").textContent = summary.plan;
  $("[data-metric-last]").textContent = last ? last.result : "--";
  $("[data-metric-top]").textContent = topCategory(history);
  $("[data-metric-total]").textContent = history.length;
}

function renderHistory() {
  const history = getHistory(session);

  elements.historyBody.innerHTML = history.length
    ? history.map((item) => `
      <tr>
        <td>${formatDate(item.createdAt)}</td>
        <td>${item.category}</td>
        <td>${item.value} ${item.from}</td>
        <td>${item.result}</td>
        <td><button class="mini-btn" type="button" data-repeat="${item.signature}">Repetir</button></td>
      </tr>
    `).join("")
    : '<tr><td colspan="5">Nenhuma conversão ainda. Faça a primeira no painel acima.</td></tr>';
}

function renderFavorites() {
  const favorites = getFavorites(session);

  elements.favorites.innerHTML = favorites.length
    ? favorites.map((item) => `
      <button class="favorite-chip" type="button" data-repeat="${item.signature}">
        <strong>${item.category}</strong>
        <span>${item.value} ${item.from} → ${item.result}</span>
      </button>
    `).join("")
    : '<p class="muted-copy">Favoritos aparecerão aqui para repetir conversões com um clique.</p>';
}

function renderQuickActions() {
  const quick = [
    ["length", "100", "cm", "m"],
    ["temperature", "32", "fahrenheit", "celsius"],
    ["digital", "1", "GB", "MB"],
    ["currency", "100", "USD", "BRL"]
  ];

  elements.quick.innerHTML = quick.map(([categoryId, value, from, to]) => `
    <button type="button" data-quick="${categoryId}|${value}|${from}|${to}">
      ${value} ${from} → ${to}
    </button>
  `).join("");
}

function refresh() {
  renderMetrics();
  renderHistory();
  renderFavorites();
}

function openUpgradeModal() {
  elements.modal.hidden = false;
}

function closeUpgradeModal() {
  elements.modal.hidden = true;
}

function buildHistoryItem(output) {
  const item = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    categoryId: activeCategoryId,
    category: output.category,
    value: elements.value.value,
    from: elements.from.value,
    to: elements.to.value,
    result: output.formatted
  };

  return {
    ...item,
    signature: `${item.categoryId}:${item.value}:${item.from}:${item.to}`
  };
}

function runConversion({ silent = false } = {}) {
  if (!elements.value.value.trim()) {
    elements.result.textContent = "Resultado aparece aqui";
    elements.detail.textContent = "Escolha uma categoria e informe um valor.";
    return;
  }

  if (!silent && !canConvert(session)) {
    openUpgradeModal();
    return;
  }

  try {
    const output = convert({
      categoryId: activeCategoryId,
      value: elements.value.value,
      from: elements.from.value,
      to: elements.to.value
    });
    const item = buildHistoryItem(output);

    lastConversion = item;
    elements.result.textContent = output.formatted;
    elements.detail.textContent = output.detail;

    if (!silent) {
      incrementUsage(session);
      saveHistory(session, item);
      refresh();
      showToast("Conversão salva no histórico.");
    }
  } catch (error) {
    elements.result.textContent = "Não foi possível converter";
    elements.detail.textContent = error.message;
  }
}

function applyConversion(item) {
  activeCategoryId = item.categoryId;
  renderTabs(elements.search.value);
  fillUnits();
  elements.value.value = item.value;
  elements.from.value = item.from;
  elements.to.value = item.to;
  runConversion({ silent: true });
  document.querySelector("#converter").scrollIntoView({ behavior: "smooth" });
}

function setPlanPlus() {
  setPlan(session, "Plus");
  closeUpgradeModal();
  refresh();
  showToast("NeonGate Plus ativado em modo demo.");
}

function initEvents() {
  elements.tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tab]");
    if (!button) return;
    activeCategoryId = button.dataset.tab;
    renderTabs(elements.search.value);
    fillUnits();
    runConversion({ silent: true });
  });

  elements.search.addEventListener("input", () => renderTabs(elements.search.value));
  [elements.value, elements.from, elements.to].forEach((field) => field.addEventListener("input", () => runConversion({ silent: true })));

  $("[data-swap]").addEventListener("click", () => {
    [elements.from.value, elements.to.value] = [elements.to.value, elements.from.value];
    runConversion();
  });

  $("[data-copy]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(elements.result.textContent);
      showToast("Resultado copiado.");
    } catch {
      showToast("Copie manualmente o resultado exibido.");
    }
  });

  $("[data-save]").addEventListener("click", () => runConversion());

  $("[data-clear]").addEventListener("click", () => {
    elements.value.value = "";
    elements.result.textContent = "Resultado aparece aqui";
    elements.detail.textContent = "Escolha uma categoria e informe um valor.";
  });

  $("[data-favorite]").addEventListener("click", () => {
    if (!lastConversion) {
      showToast("Faça uma conversão antes de favoritar.");
      return;
    }
    toggleFavorite(session, lastConversion);
    renderFavorites();
    showToast("Favoritos atualizados.");
  });

  document.body.addEventListener("click", (event) => {
    const repeat = event.target.closest("[data-repeat]");
    const quick = event.target.closest("[data-quick]");

    if (repeat) {
      const all = [...getHistory(session), ...getFavorites(session)];
      const item = all.find((entry) => entry.signature === repeat.dataset.repeat);
      if (item) applyConversion(item);
    }

    if (quick) {
      const [categoryId, value, from, to] = quick.dataset.quick.split("|");
      applyConversion({ categoryId, value, from, to, signature: quick.dataset.quick });
    }
  });

  $("[data-clear-history]").addEventListener("click", () => {
    clearHistory(session);
    refresh();
    showToast("Histórico limpo.");
  });

  $$("[data-upgrade]").forEach((button) => button.addEventListener("click", setPlanPlus));
  $("[data-close-modal]").addEventListener("click", closeUpgradeModal);
  $(".logout-btn").addEventListener("click", logout);

  $$(".nav-stack a").forEach((link) => {
    link.addEventListener("click", () => {
      $$(".nav-stack a").forEach((item) => item.classList.remove("is-active"));
      link.classList.add("is-active");

      if (link.dataset.navCategory) {
        activeCategoryId = link.dataset.navCategory;
        elements.search.value = "";
        renderTabs();
        fillUnits();
      }
    });
  });
}

renderTabs();
fillUnits();
renderQuickActions();
refresh();
initEvents();
