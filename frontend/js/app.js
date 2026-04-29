const loginScreen = document.getElementById("loginScreen");
const dashboard = document.getElementById("dashboard");
const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const logoutBtn = document.getElementById("logoutBtn");

const checksTable = document.getElementById("checksTable");
const shiftFilter = document.getElementById("shiftFilter");
const dateFrom = document.getElementById("dateFrom");
const dateTo = document.getElementById("dateTo");
const modelFilter = document.getElementById("modelFilter");

const shiftOneTotal = document.getElementById("shiftOneTotal");
const shiftTwoTotal = document.getElementById("shiftTwoTotal");
const pendingCount = document.getElementById("pendingCount");
const dayTotal = document.getElementById("dayTotal");

const calcTotal = document.getElementById("calcTotal");
const modelAmount = document.getElementById("modelAmount");
const operatorAmount = document.getElementById("operatorAmount");
const studioAmount = document.getElementById("studioAmount");

const operatorCreateForm = document.getElementById("operatorCreateForm");
const operatorsTable = document.getElementById("operatorsTable");
const operatorAdminMessage = document.getElementById("operatorAdminMessage");
const operatorsToggle = document.getElementById("operatorsToggle");
const operatorsContent = document.getElementById("operatorsContent");
const shiftsNav = document.getElementById("shiftsNav");
const chartsNav = document.getElementById("chartsNav");
const shiftsPage = document.getElementById("shiftsPage");
const chartsPage = document.getElementById("chartsPage");
const weeklyChart = document.getElementById("weeklyChart");
const deleteCheckModal = document.getElementById("deleteCheckModal");
const cancelDeleteCheck = document.getElementById("cancelDeleteCheck");
const confirmDeleteCheck = document.getElementById("confirmDeleteCheck");
const deleteOperatorModal = document.getElementById("deleteOperatorModal");
const cancelDeleteOperator = document.getElementById("cancelDeleteOperator");
const confirmDeleteOperator = document.getElementById("confirmDeleteOperator");
const exportCsvBtn = document.getElementById("exportCsvBtn");

let currentFilteredChecks = [];

let selectedOperatorId = null;

let selectedCheckId = null;

function getTotal(check) {
  return Number(check.total) || 0;
}

function formatMoney(value) {
  const number = Number(value) || 0;
  return `$${number.toFixed(2)}`;
}

function getStatusText(status) {
  if (status === "pending") return "Ожидает";
  if (status === "accepted") return "Принят";
  if (status === "rejected") return "Отклонён";
  return status;
}

function calculatePercent() {
  const total = Number(calcTotal.value) || 0;

  const model = total * 0.3;
  const operator = total * 0.2;
  const studio = total * 0.5;

  modelAmount.textContent = formatMoney(model.toFixed(2));
  operatorAmount.textContent = formatMoney(operator.toFixed(2));
  studioAmount.textContent = formatMoney(studio.toFixed(2));
}

async function populateModels() {
  const checks = await getChecks();

  const models = [...new Set(checks.map((check) => check.model?.name).filter(Boolean))];

  modelFilter.innerHTML =
    `<option value="all">Все модели</option>` +
    models.map((model) => `<option value="${model}">${model}</option>`).join("");
}

function renderStats(checks) {
  const firstShiftTotal = checks
    .filter((check) => check.shift === 1)
    .reduce((sum, check) => sum + getTotal(check), 0);

  const secondShiftTotal = checks
    .filter((check) => check.shift === 2)
    .reduce((sum, check) => sum + getTotal(check), 0);

  const pending = checks.filter((check) => check.status === "pending").length;

  shiftOneTotal.textContent = formatMoney(firstShiftTotal);
  shiftTwoTotal.textContent = formatMoney(secondShiftTotal);
  pendingCount.textContent = pending;
  dayTotal.textContent = formatMoney(firstShiftTotal + secondShiftTotal);
}

async function renderChecks() {
  const checks = await getChecks();

  const selectedShift = shiftFilter.value;
  const selectedModel = modelFilter.value;
  const from = dateFrom.value;
  const to = dateTo.value;

  const filteredChecks = checks.filter((check) => {
    const checkDate = check.date.slice(0, 10);
    const modelName = check.model?.name || "";

    if (selectedShift !== "all" && String(check.shift) !== selectedShift) return false;
    if (selectedModel !== "all" && modelName !== selectedModel) return false;
    if (from && checkDate < from) return false;
    if (to && checkDate > to) return false;

    return true;
  });

  currentFilteredChecks = filteredChecks;

  checksTable.innerHTML = filteredChecks
    .map((check) => {
      const incomeMap = {};

      check.incomes.forEach((income) => {
        incomeMap[income.platform.key] = income.amount;
      });

      return `
        <tr>
          <td>${check.model?.name || "Без модели"}</td>
          <td>${check.date.slice(0, 10)}</td>
          <td>${check.shift} смена</td>
          <td>${formatMoney(incomeMap.stripchat || 0)}</td>
          <td>${formatMoney(incomeMap.chaturbate || 0)}</td>
          <td>${formatMoney(incomeMap.cam4 || 0)}</td>
          <td>${formatMoney(incomeMap.bongacams || 0)}</td>
          <td>${formatMoney(incomeMap.camsoda || 0)}</td>
          <td>${formatMoney(incomeMap.tonplace || 0)}</td>
          <td>${formatMoney(incomeMap.livejasmin || 0)}</td>
          <td><strong>${formatMoney(check.total)}</strong></td>
          <td>
  ${
    check.status === "pending"
      ? `
        <button class="status status-btn pending" onclick="acceptCheck(${check.id})">
          Ожидает
        </button>
      `
      : `
        <span class="status ${check.status}">
          ${getStatusText(check.status)}
        </span>
      `
  }
</td>
      <td>
  <button class="table-danger-btn" onclick="openDeleteCheckModal(${check.id})">
    Удалить
  </button>
</td>
        </tr>
      `;
    })
    .join("");

  renderStats(filteredChecks);
}

async function renderOperators() {
  const users = await getUsers();

  const operators = users.filter((user) => user.role === "operator");

  operatorsTable.innerHTML = operators
    .map((user) => {
      return `
        <tr>
          <td>${user.id}</td>
          <td>${user.email}</td>
          <td>${user.username}</td>
          <td>${user.role}</td>
          <td>${user.createdAt.slice(0, 10)}</td>
          <td>
            <button class="danger-btn" onclick="openDeleteOperatorModal(${user.id})">
              Удалить
            </button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function openDeleteOperatorModal(id) {
  selectedOperatorId = id;
  deleteOperatorModal.classList.remove("hidden");
}

function closeDeleteOperatorModal() {
  selectedOperatorId = null;
  deleteOperatorModal.classList.add("hidden");
}

cancelDeleteOperator.addEventListener("click", closeDeleteOperatorModal);

deleteOperatorModal.addEventListener("click", (event) => {
  if (event.target === deleteOperatorModal) {
    closeDeleteOperatorModal();
  }
});

confirmDeleteOperator.addEventListener("click", async () => {
  if (!selectedOperatorId) return;

  const result = await deleteUser(selectedOperatorId);

  operatorAdminMessage.textContent = result.message || "Оператор удалён";

  closeDeleteOperatorModal();

  await renderOperators();
});

async function initAdminDashboard() {
  loginScreen.classList.add("hidden");
  dashboard.classList.remove("hidden");

  await populateModels();
  await renderChecks();
  await renderOperators();
  await renderWeeklyChart();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const data = await loginRequest(email, password);

  if (!data.token) {
    loginError.textContent = data.message || "Ошибка входа";
    return;
  }

  if (data.user.role !== "admin") {
    loginError.textContent = "Доступ только для администратора";
    return;
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  await initAdminDashboard();
});

logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  dashboard.classList.add("hidden");
  loginScreen.classList.remove("hidden");
});

shiftFilter.addEventListener("change", renderChecks);
dateFrom.addEventListener("change", renderChecks);
dateTo.addEventListener("change", renderChecks);
modelFilter.addEventListener("change", renderChecks);

calcTotal.addEventListener("input", calculatePercent);

operatorCreateForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const userData = {
    email: document.getElementById("newOperatorEmail").value,
    username: document.getElementById("newOperatorUsername").value,
    password: document.getElementById("newOperatorPassword").value,
    role: "operator",
  };

  const result = await createUser(userData);

  operatorAdminMessage.textContent = result.message || "Оператор создан";

  operatorCreateForm.reset();

  await renderOperators();
});

operatorsToggle.addEventListener("click", () => {
  const isCollapsed = operatorsContent.classList.toggle("collapsed");
  operatorsToggle.textContent = isCollapsed ? "Развернуть" : "Свернуть";
});

const savedUser = JSON.parse(localStorage.getItem("user"));

if (localStorage.getItem("token") && savedUser?.role === "admin") {
  initAdminDashboard();
}

function getLastSevenDays() {
  const days = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const iso = date.toISOString().slice(0, 10);

    days.push({
      date: iso,
      label: iso.slice(5),
      total: 0,
    });
  }

  return days;
}

async function renderWeeklyChart() {
  const checks = await getChecks();
  const days = getLastSevenDays();

  checks.forEach((check) => {
    const checkDate = check.date.slice(0, 10);
    const day = days.find((item) => item.date === checkDate);

    if (day) {
      day.total += Number(check.total) || 0;
    }
  });

  const maxTotal = Math.max(...days.map((day) => day.total), 1);

  weeklyChart.innerHTML = days
    .map((day) => {
      const height = (day.total / maxTotal) * 100;

      return `
        <div class="chart-item">
          <div class="chart-value">${formatMoney(day.total)}</div>
          <div class="chart-bar-wrap">
            <div class="chart-bar" style="height: ${height}%"></div>
          </div>
          <div class="chart-label">${day.label}</div>
        </div>
      `;
    })
    .join("");
}

shiftsNav.addEventListener("click", () => {
  shiftsPage.classList.remove("hidden");
  chartsPage.classList.add("hidden");

  shiftsNav.classList.add("active");
  chartsNav.classList.remove("active");
});

chartsNav.addEventListener("click", async () => {
  shiftsPage.classList.add("hidden");
  chartsPage.classList.remove("hidden");

  chartsNav.classList.add("active");
  shiftsNav.classList.remove("active");

  await renderWeeklyChart();
});

function openDeleteCheckModal(id) {
  selectedCheckId = id;
  deleteCheckModal.classList.remove("hidden");
}

function closeDeleteCheckModal() {
  selectedCheckId = null;
  deleteCheckModal.classList.add("hidden");
}

cancelDeleteCheck.addEventListener("click", closeDeleteCheckModal);

deleteCheckModal.addEventListener("click", (event) => {
  if (event.target === deleteCheckModal) {
    closeDeleteCheckModal();
  }
});

confirmDeleteCheck.addEventListener("click", async () => {
  if (!selectedCheckId) return;

  await deleteCheck(selectedCheckId);

  closeDeleteCheckModal();

  await populateModels();
  await renderChecks();
  await renderWeeklyChart();
});

async function acceptCheck(id) {
  await updateCheckStatus(id, "accepted");

  await populateModels();
  await renderChecks();
  await renderWeeklyChart();
}

function getIncomeMap(check) {
  const incomeMap = {};

  check.incomes.forEach((income) => {
    incomeMap[income.platform.key] = income.amount;
  });

  return incomeMap;
}

function exportChecksToCsv() {
  if (!currentFilteredChecks.length) {
    return;
  }

  const rows = currentFilteredChecks.map((check) => {
    const incomeMap = getIncomeMap(check);

    return `
      <tr>
        <td>${check.model?.name || "Без модели"}</td>
        <td>${check.date.slice(0, 10)}</td>
        <td>${check.shift} смена</td>
        <td>${incomeMap.stripchat || 0}</td>
        <td>${incomeMap.chaturbate || 0}</td>
        <td>${incomeMap.cam4 || 0}</td>
        <td>${incomeMap.bongacams || 0}</td>
        <td>${incomeMap.camsoda || 0}</td>
        <td>${incomeMap.tonplace || 0}</td>
        <td>${incomeMap.livejasmin || 0}</td>
        <td>${check.total || 0}</td>
        <td>${getStatusText(check.status)}</td>
      </tr>
    `;
  }).join("");

  const html = `
    <html>
      <head>
        <meta charset="UTF-8" />
        <style>
          table {
            border-collapse: collapse;
            width: 100%;
            font-family: Arial, sans-serif;
          }

          th {
            background: #1f1f24;
            color: #ffffff;
            font-weight: bold;
            border: 1px solid #444;
            padding: 10px;
            text-align: center;
          }

          td {
            border: 1px solid #999;
            padding: 8px;
            text-align: center;
          }

          tr:nth-child(even) {
            background: #f2f2f2;
          }

          .title {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 14px;
          }

          .total {
            font-weight: bold;
            background: #d9ead3;
          }
        </style>
      </head>
      <body>
        <div class="title">CRM отчёт по чекам</div>

        <table>
          <thead>
            <tr>
              <th>Модель</th>
              <th>Дата</th>
              <th>Смена</th>
              <th>Stripchat</th>
              <th>Chaturbate</th>
              <th>Cam4</th>
              <th>BongaCams</th>
              <th>Camsoda</th>
              <th>Ton.place</th>
              <th>LiveJasmin</th>
              <th>Total</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </body>
    </html>
  `;

  const link = document.createElement("a");

const uri = "data:application/vnd.ms-excel;charset=utf-8," + encodeURIComponent(html);

link.href = uri;

const today = new Date().toISOString().slice(0, 10);
link.download = `crm-report-${today}.xls`;

document.body.appendChild(link);
link.click();
document.body.removeChild(link);
}

exportCsvBtn.addEventListener("click", exportChecksToCsv);