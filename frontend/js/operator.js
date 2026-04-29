const operatorLoginScreen = document.getElementById("operatorLoginScreen");
const operatorDashboard = document.getElementById("operatorDashboard");
const operatorLoginForm = document.getElementById("operatorLoginForm");
const operatorLoginError = document.getElementById("operatorLoginError");
const operatorLogoutBtn = document.getElementById("operatorLogoutBtn");
const operatorCheckForm = document.getElementById("operatorCheckForm");
const operatorCheckMessage = document.getElementById("operatorCheckMessage");
const platformFields = document.getElementById("platformFields");

let platforms = [];

async function renderPlatformFields() {
  platforms = await getPlatforms();

  if (!Array.isArray(platforms)) {
    platformFields.innerHTML = `<p class="form-message">Не удалось загрузить площадки</p>`;
    return;
  }

  platformFields.innerHTML = platforms
    .map((platform) => {
      return `
        <div class="field">
          <label>${platform.name}</label>
          <input 
            type="number" 
            data-platform-key="${platform.key}" 
            placeholder="0" 
            min="0" 
          />
        </div>
      `;
    })
    .join("");
}

async function showOperatorDashboard() {
  operatorLoginScreen.classList.add("hidden");
  operatorDashboard.classList.remove("hidden");

  await renderPlatformFields();
}

operatorLoginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("operatorEmail").value;
  const password = document.getElementById("operatorPassword").value;

  const data = await loginRequest(email, password);

  if (!data.token) {
    operatorLoginError.textContent = data.message || "Ошибка входа";
    return;
  }

  if (data.user.role !== "operator") {
    operatorLoginError.textContent = "Доступ только для оператора";
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  await showOperatorDashboard();
});

operatorLogoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  operatorDashboard.classList.add("hidden");
  operatorLoginScreen.classList.remove("hidden");
});

operatorCheckForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const incomeInputs = document.querySelectorAll("[data-platform-key]");
  const incomes = {};

  incomeInputs.forEach((input) => {
    const key = input.dataset.platformKey;
    incomes[key] = Number(input.value) || 0;
  });

  const checkData = {
    modelName: document.getElementById("modelName").value,
    date: document.getElementById("checkDate").value,
    shift: Number(document.getElementById("checkShift").value),
    incomes,
  };

  const result = await createCheck(checkData);

  if (result.id || result.check) {
    operatorCheckMessage.textContent = "Чек отправлен администратору";
    operatorCheckForm.reset();
    await renderPlatformFields();
    return;
  }

  operatorCheckMessage.textContent = result.message || "Ошибка отправки чека";
});

const savedUser = JSON.parse(localStorage.getItem("user"));

if (localStorage.getItem("token") && savedUser?.role === "operator") {
  showOperatorDashboard();
}