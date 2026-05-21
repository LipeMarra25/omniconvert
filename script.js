const root = document.documentElement;
const themeToggle = document.querySelector(".theme-toggle");
const passwordInput = document.querySelector('input[name="password"]');
const passwordToggle = document.querySelector(".password-toggle");
const form = document.querySelector(".login-form");
const toast = document.querySelector(".toast");
const submitButton = document.querySelector(".submit-btn");

const savedTheme = localStorage.getItem("orbit-theme");
const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;

if (savedTheme === "light" || (!savedTheme && prefersLight)) {
  root.classList.add("light");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

themeToggle.addEventListener("click", () => {
  root.classList.toggle("light");
  localStorage.setItem("orbit-theme", root.classList.contains("light") ? "light" : "dark");
});

passwordToggle.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";

  passwordInput.type = isPassword ? "text" : "password";
  passwordToggle.classList.toggle("is-visible", isPassword);
  passwordToggle.setAttribute("aria-label", isPassword ? "Ocultar senha" : "Mostrar senha");
  passwordInput.focus();
});

form.addEventListener("submit", async (event) => {
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
  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "Sincronizando...";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password")
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Não foi possível entrar agora.");
    }

    localStorage.setItem("orbit-session", JSON.stringify(data.session));
    showToast("Email salvo. Abrindo dashboard...");

    window.setTimeout(() => {
      window.location.href = data.redirectTo;
    }, 700);
  } catch (error) {
    showToast(error.message);
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "Entrar na órbita";
  }
});

form.addEventListener("input", (event) => {
  const field = event.target.closest(".field");

  if (field) {
    field.classList.remove("is-invalid");
  }
});
