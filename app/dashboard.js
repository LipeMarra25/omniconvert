import { tools } from "./tools/tool-registry.js";
import { categories, convertAsync, findCategory, searchableText } from "./conversion-engine.js";
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

const CATEGORY_GROUPS = [
  { id: "units", label: "Units", icon: "↔", match: ["Converter"] },
  { id: "currency", label: "Currency", icon: "$", match: ["Moedas"] },
  { id: "scientific", label: "Scientific", icon: "∑", match: ["CientÃ­fico", "Cientifico"] },
  { id: "data", label: "Data", icon: "01", match: ["Dados e Tecnologia", "Bases NumÃ©ricas", "Bases Numericas"] },
  { id: "colors", label: "Colors", icon: "#", categories: ["colors"] },
  { id: "time", label: "Time", icon: "◷", categories: ["time", "dates"] },
  { id: "dev", label: "Dev Tools", icon: "</>", categories: ["text", "bases", "digital"] }
];

const MAIN_CATEGORY_GROUPS = [
  { id: "units", label: "Units", icon: "U", categories: ["length", "mass", "volume", "area", "speed", "temperature", "cooking"] },
  { id: "currency", label: "Currency", icon: "$", categories: ["currency"] },
  { id: "data", label: "Data", icon: "01", categories: ["digital", "bases", "text"] },
  { id: "scientific", label: "Scientific", icon: "S", categories: ["scientific", "energy", "power", "pressure"] },
  { id: "time", label: "Time", icon: "T", categories: ["time", "dates"] },
  { id: "colors", label: "Colors", icon: "#", categories: ["colors"] }
];

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const setText = (selector, value) => {
  const element = $(selector);

  if (element) {
    element.textContent = value;
  }
};

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
  quickTargets: $$("[data-quick-actions]"),
  modal: $("[data-upgrade-modal]"),
  toast: $(".toast"),
  toolsGrid: $("[data-tools-grid]"),
  categoryTabs: $("[data-category-tabs]"),
  suggestions: $("[data-search-suggestions]"),
  resultCard: $("[data-result-card]"),
  resultFormula: $("[data-result-formula]"),
  resultTime: $("[data-result-time]"),
  recentPanel: $("[data-recent-panel]")
};

function groupForCategory(category) {
  return MAIN_CATEGORY_GROUPS.find((group) => {
    if (group.categories?.includes(category.id)) return true;
    return false;
  }) || MAIN_CATEGORY_GROUPS[0];
}

function activeGroupId() {
  return groupForCategory(currentCategory()).id;
}

function renderTools() {
  elements.toolsGrid.innerHTML = tools.map((tool) => `
    <article class="tool-card" data-tool-id="${tool.id}">
      <div>
        <span class="tool-group">${tool.group}</span>
        <h3>${tool.name}</h3>
        <p>${tool.description}</p>
      </div>

      <span class="plan-badge ${tool.premium ? "is-plus" : "is-free"}">
        ${tool.premium ? "Plus" : "Free"}
      </span>
    </article>
  `).join("");
}

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
  setText("[data-result-formula]", `${category.unitList[0]} to ${category.unitList[Math.min(1, category.unitList.length - 1)]}`);
}

function renderCategoryTabs() {
  elements.categoryTabs.innerHTML = MAIN_CATEGORY_GROUPS.map((group) => `
    <button class="category-pill ${group.id === activeGroupId() ? "is-active" : ""}" type="button" data-category-group="${group.id}">
      <span>${group.icon}</span>
      ${group.label}
    </button>
  `).join("");
}

function renderTabs(filter = "") {
  const query = filter.trim().toLowerCase();
  const selectedGroup = activeGroupId();
  const filtered = categories.filter((category) => {
    const matchesSearch = !query || searchableText(category).includes(query);
    const matchesGroup = query || groupForCategory(category).id === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  elements.tabs.innerHTML = filtered.map((category) => `
    <button class="subcategory-card ${category.id === activeCategoryId ? "is-active" : ""}" type="button" data-tab="${category.id}">
      <span>${category.group}</span>
      <strong>${category.name}</strong>
      <small>${category.unitList.slice(0, 4).join(" · ")}</small>
    </button>
  `).join("");

  const suggestions = query
    ? categories.filter((category) => searchableText(category).includes(query)).slice(0, 5)
    : [];

  elements.suggestions.innerHTML = suggestions.map((category) => `
    <button type="button" data-tab="${category.id}">${category.name}</button>
  `).join("");

  if (!filtered.some((category) => category.id === activeCategoryId) && filtered[0]) {
    activeCategoryId = filtered[0].id;
    fillUnits();
  }

  renderCategoryTabs();
}

function renderMetrics() {
  const history = getHistory(session);
  const favorites = getFavorites(session);
  const summary = usageSummary(session);
  const last = history[0];

  elements.email.textContent = session.email;
  $("[data-plan-label]").textContent = summary.plan;
  $("[data-usage-ring]").textContent = summary.plan === "Plus" ? "∞" : `${summary.usage.count}/${summary.limit}`;
  $("[data-usage-copy]").textContent = summary.plan === "Plus"
    ? "Unlimited conversion power active with OmniConvert Plus."
    : `${summary.remaining} conversões restantes hoje no plano Free.`;
  $("[data-metric-today]").textContent = summary.usage.count;
  $("[data-metric-remaining]").textContent = summary.remaining;
  $("[data-metric-plan]").textContent = summary.plan;
  $("[data-metric-favorites]").textContent = favorites.length;
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

function renderRecentPanel() {
  const history = getHistory(session).slice(0, 4);
  const favorites = getFavorites(session).slice(0, 3);
  const items = history.length ? history : favorites;

  elements.recentPanel.innerHTML = items.length
    ? items.map((item) => `
      <button class="recent-item" type="button" data-repeat="${item.signature}">
        <span>${item.category}</span>
        <strong>${item.value} ${item.from} → ${item.result}</strong>
      </button>
    `).join("")
    : '<p class="muted-copy">Your recent conversions and favorites will appear here.</p>';
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

function renderQuickActionsEverywhere() {
  const quick = [
    ["length", "100", "cm", "m"],
    ["temperature", "32", "fahrenheit", "celsius"],
    ["digital", "1", "GB", "MB"],
    ["currency", "100", "USD", "BRL"]
  ];

  const markup = quick.map(([categoryId, value, from, to]) => `
    <button type="button" data-quick="${categoryId}|${value}|${from}|${to}">
      ${value} ${from} → ${to}
    </button>
  `).join("");

  elements.quickTargets.forEach((target) => {
    target.innerHTML = markup;
  });
}

function refresh() {
  renderMetrics();
  renderHistory();
  renderFavorites();
  renderRecentPanel();
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

async function runConversion({ silent = false } = {}) {
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
    elements.detail.textContent = activeCategoryId === "currency"
      ? "Buscando cotação em tempo real..."
      : "Calculando...";

    const output = await convertAsync({
      categoryId: activeCategoryId,
      value: elements.value.value,
      from: elements.from.value,
      to: elements.to.value
    });
    const item = buildHistoryItem(output);

    lastConversion = item;
    elements.result.textContent = output.formatted;
    elements.resultCard.classList.remove("is-updated");
    void elements.resultCard.offsetWidth;
    elements.resultCard.classList.add("is-updated");
    elements.resultTime.textContent = new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date());
    elements.resultFormula.textContent = `${item.value} ${item.from} = ${output.formatted}`;
    elements.detail.textContent = output.provider === "engine local"
      ? output.detail
      : `${output.detail} • ${output.provider} • ${output.rateDate}${output.warning ? " • fallback ativo" : ""}`;

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
  showToast("OmniConvert Plus ativado em modo demo.");
}

function initEvents() {
  elements.categoryTabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category-group]");
    if (!button) return;

    const firstMatch = categories.find((category) => groupForCategory(category).id === button.dataset.categoryGroup);
    if (!firstMatch) return;

    activeCategoryId = firstMatch.id;
    elements.search.value = "";
    renderTabs();
    fillUnits();
    runConversion({ silent: true });
  });

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
    elements.resultFormula.textContent = "Conversion preview appears instantly.";
    elements.resultTime.textContent = "Ready";
  });

  // TODO: Connect Share to a real share/export flow in the next converter polish pass.

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
    const navCategory = event.target.closest("[data-nav-category]");
    const suggestedTab = event.target.closest("[data-tab]");

    if (suggestedTab && !event.target.closest("[data-tabs]")) {
      activeCategoryId = suggestedTab.dataset.tab;
      elements.search.value = "";
      renderTabs();
      fillUnits();
      runConversion({ silent: true });
    }

    if (repeat) {
      const all = [...getHistory(session), ...getFavorites(session)];
      const item = all.find((entry) => entry.signature === repeat.dataset.repeat);
      if (item) applyConversion(item);
    }

    if (quick) {
      const [categoryId, value, from, to] = quick.dataset.quick.split("|");
      applyConversion({ categoryId, value, from, to, signature: quick.dataset.quick });
    }

    if (navCategory) {
      activeCategoryId = navCategory.dataset.navCategory;
      elements.search.value = "";
      renderTabs();
      fillUnits();
      document.querySelector("#converter").scrollIntoView({ behavior: "smooth" });
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
renderQuickActionsEverywhere();
renderTools();
refresh();
initEvents();
