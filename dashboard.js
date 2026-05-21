const session = JSON.parse(localStorage.getItem("orbit-session") || "null");

const emailElement = document.querySelector("[data-user-email]");
const totalElement = document.querySelector("[data-total-leads]");
const uniqueElement = document.querySelector("[data-unique-leads]");
const lastLoginElement = document.querySelector("[data-last-login]");
const apiStatusElement = document.querySelector("[data-api-status]");
const leadsBody = document.querySelector("[data-leads-body]");
const logoutButton = document.querySelector(".logout-btn");

emailElement.textContent = session?.email || "preview@orbit.local";

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

async function loadDashboard() {
  try {
    const response = await fetch("/api/leads");
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Falha ao carregar dados.");
    }

    totalElement.textContent = data.total;
    uniqueElement.textContent = data.unique;
    lastLoginElement.textContent = data.lastLogin ? formatDate(data.lastLogin) : "--:--";
    apiStatusElement.textContent = "Online";

    if (!session?.email && data.leads[0]?.email) {
      emailElement.textContent = data.leads[0].email;
    }

    const rows = data.leads.slice(0, 8).map((lead) => `
      <tr>
        <td>${lead.email}</td>
        <td>${formatDate(lead.createdAt)}</td>
        <td>${lead.source}</td>
      </tr>
    `);

    leadsBody.innerHTML = rows.length
      ? rows.join("")
      : '<tr><td colspan="3">Nenhum email salvo ainda.</td></tr>';
  } catch (error) {
    apiStatusElement.textContent = "Offline";
    leadsBody.innerHTML = `<tr><td colspan="3">${error.message}</td></tr>`;
  }
}

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("orbit-session");
  window.location.href = "/";
});

loadDashboard();
