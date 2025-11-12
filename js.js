// --- KONFIGURACJA ---
const API_URL = "http://10.103.8.115/projekt-zespo-owy/api.php";

// --- ELEMENTY FORMULARZA ---
const form = document.querySelector("form");
const status = document.createElement("p");
form.appendChild(status);

// --- LOGOWANIE ---
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  status.textContent = "Logowanie...";

  const username = document.getElementById("login").value.trim();
  const password = document.getElementById("haslo").value.trim();

  try {
    const res = await fetch(`${API_URL}/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      status.textContent = data.error || "Nie udało się zalogować";
      console.error("Błąd logowania:", data);
      return;
    }

    if (!data.token) {
      status.textContent = "Brak tokenu w odpowiedzi serwera";
      return;
    }

    localStorage.setItem("jwt", data.token);
    status.textContent = "✅ Zalogowano pomyślnie!";
    console.log("Token JWT zapisany:", data.token);

    // automatyczne załadowanie tablicy
    await loadBoard();
  } catch (err) {
    console.error("Błąd połączenia:", err);
    status.textContent = "❌ Błąd połączenia z serwerem";
  }
});

// --- OBSŁUGA TABLICY ---
const textarea = document.querySelector(".tablica-textarea");

function getToken() {
  return localStorage.getItem("jwt");
}

// Pobierz treść tablicy
async function loadBoard() {
  if (!textarea) return;
  const token = getToken();
  if (!token) {
    console.warn("Brak tokenu — najpierw zaloguj się");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/board`, {
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("❌ Nie udało się pobrać tablicy:", data);
      return;
    }

    textarea.value = data.content || "";
    console.log("✅ Tablica załadowana");
  } catch (err) {
    console.error("Błąd pobierania tablicy:", err);
  }
}

// Zapisz tablicę po 1s bezczynności
let saveTimeout;
textarea?.addEventListener("input", () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveBoard, 1000);
});

async function saveBoard() {
  if (!textarea) return;
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/board`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ content: textarea.value }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.warn("❌ Błąd zapisu:", data);
      return;
    }

    console.log("✅ Tablica zapisana");
    showSaveMessage();
  } catch (err) {
    console.error("Błąd zapisu:", err);
  }
}

// Komunikat „Zapisano ✅”
function showSaveMessage() {
  let msg = document.querySelector(".save-toast");
  if (!msg) {
    msg = document.createElement("div");
    msg.className = "save-toast";
    msg.textContent = "Zapisano ✅";
    Object.assign(msg.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      background: "#4caf50",
      color: "white",
      padding: "10px 20px",
      borderRadius: "12px",
      opacity: "0",
      transition: "opacity 0.3s",
      zIndex: "1000",
    });
    document.body.appendChild(msg);
  }
  msg.style.opacity = "1";
  setTimeout(() => (msg.style.opacity = "0"), 1500);
}

// Jeśli już zalogowany — pobierz tablicę
if (getToken()) {
  loadBoard();
}
