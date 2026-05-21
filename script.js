const passwordInput = document.querySelector('input[name="password"]');
const passwordToggle = document.querySelector(".password-toggle");
const form = document.querySelector(".auth-form");
const toast = document.querySelector(".toast");
const submitButton = document.querySelector(".submit-btn");
const strengthText = document.querySelector("[data-strength-text]");
const strengthBars = [...document.querySelectorAll(".signal-bar")];

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

function updateStrength(value) {
  if (!strengthText) {
    return;
  }

  const score = [
    value.length >= 6,
    /[A-Z]/.test(value),
    /[0-9]/.test(value) || /[^A-Za-z0-9]/.test(value)
  ].filter(Boolean).length;

  const labels = ["senha em modo stealth", "sinal inicial", "sinal estável", "sinal neon forte"];

  strengthText.textContent = labels[score];
  strengthBars.forEach((bar, index) => bar.classList.toggle("is-active", index < score));
}

passwordToggle?.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";
  passwordToggle.classList.toggle("is-visible", isPassword);
  passwordToggle.setAttribute("aria-label", isPassword ? "Ocultar senha" : "Mostrar senha");
  passwordInput.focus();
});

passwordInput?.addEventListener("input", () => updateStrength(passwordInput.value));

form?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fields = [...form.querySelectorAll(".field")];
  let isValid = true;

  fields.forEach((field) => {
    const input = field.querySelector("input");
    const invalid = !input.checkValidity();

    field.classList.toggle("is-invalid", invalid);
    isValid = isValid && !invalid;
  });

  if (!isValid) {
    form.querySelector(".is-invalid input")?.focus();
    return;
  }

  const formData = new FormData(form);
  const buttonLabel = form.dataset.buttonLabel || "Entrar";

  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = form.dataset.loadingLabel || "Sincronizando...";

  try {
    const response = await fetch(form.dataset.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Não foi possível concluir agora.");
    }

    localStorage.setItem("omni-session", JSON.stringify(data.session));
    showToast(form.dataset.successLabel || "Acesso liberado.");

    window.setTimeout(() => {
      window.location.href = data.redirectTo;
    }, 700);
  } catch (error) {
    showToast(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = buttonLabel;
  }
});

form?.addEventListener("input", (event) => {
  const field = event.target.closest(".field");

  if (field) {
    field.classList.remove("is-invalid");
  }
});
