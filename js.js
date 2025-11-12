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
    // załaduj chat
    loadMessages();
  } catch (err) {
    console.error("Błąd połączenia:", err);
    status.textContent = "❌ Błąd połączenia z serwerem";
  }
});

// --- POBIERANIE TOKENU ---
function getToken() {
  return localStorage.getItem("jwt");
}

// --- OBSŁUGA TABLICY ---
const textarea = document.querySelector(".tablica-textarea");

async function loadBoard() {
  if (!textarea) return;
  const token = getToken();
  if (!token) {
    textarea.setAttribute("readonly", true);
    textarea.placeholder = "Zaloguj się, aby edytować tablicę";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/board`, {
      headers: { Authorization: "Bearer " + token },
    });

    const data = await res.json();
    textarea.value = data.content || "";

    // Sprawdź rolę użytkownika z tokenu
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'nauczyciel') {
      textarea.setAttribute("readonly", true);
      textarea.style.backgroundColor = "#f0f0f0"; // szare tło dla nieaktywnej
    } else {
      textarea.removeAttribute("readonly");
      textarea.style.backgroundColor = "white";
    }
  } catch (err) {
    console.error("Błąd pobierania tablicy:", err);
    textarea.setAttribute("readonly", true);
  }
}

let saveTimeout;
textarea?.addEventListener("input", () => {
  const token = getToken();
  if (!token) return;

  const payload = JSON.parse(atob(token.split('.')[1]));
  if (payload.role !== 'nauczyciel') return; // blokada dla uczniów

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

// --- CHAT ---
const chatBox = document.querySelector(".chat > div"); // div z wiadomości
const chatInput = document.querySelector(".chat input");
const chatBtn = document.querySelector(".chat button");
let lastMessageId = 0;

async function loadMessages() {
  const token = getToken();
  if (!token) return;

  try {
    const res = await fetch(`${API_URL}/messages?last_id=${lastMessageId}`, {
      headers: { Authorization: "Bearer " + token },
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Błąd pobierania wiadomości:", data);
      return;
    }

    data.forEach(msg => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${msg.name}:</strong> ${msg.text}`;
      chatBox.appendChild(div);
      lastMessageId = msg.id;
      chatBox.scrollTop = chatBox.scrollHeight;
    });
  } catch (err) {
    console.error("Błąd fetch chat:", err);
  }
}

async function sendMessage() {
  const token = getToken();
  if (!token) return;
  const text = chatInput.value.trim();
  if (!text) return;

  try {
    const res = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ text }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Błąd wysyłania wiadomości:", data);
      return;
    }

    chatInput.value = "";
    await loadMessages(); // odśwież chat natychmiast po wysłaniu
  } catch (err) {
    console.error("Błąd fetch wysyłania:", err);
  }
}

// --- OBSŁUGA PRZYCISKU I ENTER ---
chatBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// --- AUTO ODŚWIEŻANIE CHATU co 2 sekundy ---
setInterval(loadMessages, 2000);

// --- POCZĄTKOWE ZAŁADOWANIE ---
if (getToken()) {
  loadBoard();
  loadMessages();
}
