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
  if (!token) {
    console.warn("❌ Nie jesteś zalogowany — nie można zapisać tablicy");
    showSaveMessage("❌ Zaloguj się, aby zapisać");
    return;
  }

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
      showSaveMessage("❌ Nie udało się zapisać");
      return;
    }

    console.log("✅ Tablica zapisana");
    showSaveMessage(); // standardowy komunikat "Zapisano ✅"
  } catch (err) {
    console.error("Błąd zapisu:", err);
    showSaveMessage("❌ Błąd połączenia");
  }
}

// modyfikacja showSaveMessage żeby można było przekazać własny komunikat
function showSaveMessage(msgText = "Zapisano ✅") {
  let msg = document.querySelector(".save-toast");
  if (!msg) {
    msg = document.createElement("div");
    msg.className = "save-toast";
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
  msg.textContent = msgText;
  msg.style.opacity = "1";
  setTimeout(() => (msg.style.opacity = "0"), 1500);
}


// Jeśli już zalogowany — pobierz tablicę
if (getToken()) {
loadBoard();
}


// --- KONFIGURACJA CHATU ---
const chatBox = document.querySelector(".chat > div"); // div z wiadomościami
const chatInput = document.querySelector(".chat input");
const chatBtn = document.querySelector(".chat button");
let lastMessageId = 0;

// --- POBIERANIE TOKENU ---
function getToken() {
  return localStorage.getItem("jwt");
}

// --- FUNKCJA POBIERANIA WIADOMOŚCI ---
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

// --- FUNKCJA WYSYŁANIA WIADOMOŚCI ---
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

// --- OBSŁUGA PRZYCISKU ---
chatBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", e => {
  if (e.key === "Enter") sendMessage();
});

// --- AUTO ODŚWIEŻANIE CHATU co 2 sekundy ---
setInterval(loadMessages, 2000);

// --- POCZĄTKOWE ZAŁADOWANIE CHATU ---
if (getToken()) loadMessages();

// ==========================
//        NOTATKA
// ==========================
const noteArea = document.querySelector(".notatka-textarea");
let noteSaveTimeout;

// Pobierz token
function getToken() {
  return localStorage.getItem("jwt");
}

// ---- POBIERZ NOTATKĘ ----
async function loadNote() {
  const token = getToken();
  if (!token) {
    console.warn("Brak tokenu — najpierw zaloguj się");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/notes`, {
      headers: { Authorization: "Bearer " + token }
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Błąd pobierania notatki:", data);
      return;
    }

    noteArea.value = data.content || "";
    console.log("📒 Notatka załadowana");
  } catch (err) {
    console.error("Błąd loadNote:", err);
  }
}

// ---- ZAPIS NOTATKI ----
async function saveNote() {
  const token = getToken();
  if (!token) {
    console.warn("Brak tokenu — nie można zapisać notatki");
    showSaveMessage("❌ Zaloguj się, aby zapisać");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ content: noteArea.value }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("❌ Błąd zapisu notatki:", data);
      showSaveMessage("❌ Nie udało się zapisać");
      return;
    }

    console.log("📒 Notatka zapisana");
    showSaveMessage(); // "Zapisano ✓"
  } catch (err) {
    console.error("Błąd saveNote:", err);
    showSaveMessage("❌ Błąd połączenia");
  }
}

// ---- AUTOSAVE po 1 sek ----
noteArea?.addEventListener("input", () => {
  clearTimeout(noteSaveTimeout);
  noteSaveTimeout = setTimeout(saveNote, 1000);
});

// ---- AUTOMATYCZNE ŁADOWANIE NOTATKI PO ZALOGOWANIU ----
if (getToken()) {
  loadNote();
}
