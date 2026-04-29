const API_URL = "https://crm-wc.onrender.com";

async function loginRequest(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  return response.json();
}

async function getChecks() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/checks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

async function createCheck(checkData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/checks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(checkData),
  });

  return response.json();
}

async function getUsers() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

async function createUser(userData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
  });

  return response.json();
}

async function deleteUser(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

async function getPlatforms() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/platforms`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

async function deleteCheck(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/checks/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

async function updateCheckStatus(id, status) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/checks/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  return response.json();
}