// ==========================
//       KONFIGURACJA
// ==========================
const API_URL = "http://10.103.8.115/projekt-zespo-owy/api.php";

let USER_ROLE = null; // "nauczyciel" lub "uczen"

// ==========================
//  DEKODOWANIE JWT aby znać rolę
// ==========================
function decodeJWT(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch (err) {
    return null;
  }
}

function getToken() {
  return localStorage.getItem("jwt");
}

function updateRole() {
  const token = getToken();
  if (!token) return (USER_ROLE = null);

  const payload = decodeJWT(token);
  USER_ROLE = payload?.role || null;
}

// ==========================
//      ELEMENTY FORM
// ==========================
const form = document.querySelector("form");
const status = document.createElement("p");
form?.appendChild(status);

// ==========================
//       LOGOWANIE
// ==========================
form?.addEventListener("submit", async (e) => {
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

    if (!res.ok || !data.token) {
      status.textContent = "❌ Błędny login lub hasło";
      return;
    }

    localStorage.setItem("jwt", data.token);
    updateRole();

    status.textContent = "✅ Zalogowano pomyślnie!";

    applyPermissions();
    loadBoard();
    loadNote();
    loadMessages();
  } catch (err) {
    status.textContent = "❌ Błąd połączenia";
  }
});

const logoutBtn = document.getElementById("logoutBtn");

logoutBtn?.addEventListener("click", () => {
  // 1. Usuń token
  localStorage.removeItem("jwt");

  // 2. Zresetuj rolę
  USER_ROLE = null;

  // 3. Ukryj i zablokuj elementy
  const tablicaBox = document.querySelector(".tablica");
  const notatkaBox = document.querySelector(".notatka");
  const chatBoxContainer = document.querySelector(".chat");

  tablicaBox.style.display = "none";
  notatkaBox.style.display = "none";
  chatBoxContainer.style.display = "none";

  textarea.value = "";
  noteArea.value = "";
  chatBox.innerHTML = "";

  textarea.disabled = true;
  noteArea.disabled = true;
  chatInput.disabled = true;
  chatBtn.disabled = true;

  // 4. Komunikat
  showSaveMessage("Wylogowano ✔️");
});

// ==========================
//        TABLICA
// ==========================
const textarea = document.querySelector(".tablica-textarea");

// WŁĄCZ / WYŁĄCZ EDYCJĘ TABLICY
function applyPermissions() {
  const isLogged = !!getToken();

  const tablicaBox = document.querySelector(".tablica");
  const notatkaBox = document.querySelector(".notatka");
  const chatBoxContainer = document.querySelector(".chat");

  // ukryj wszystko dla niezalogowanych
  if (!isLogged) {
    tablicaBox.style.display = "none";
    notatkaBox.style.display = "none";
    chatBoxContainer.style.display = "none";
    return;
  }

  // pokaż po zalogowaniu
  tablicaBox.style.display = "block";
  notatkaBox.style.display = "block";
  chatBoxContainer.style.display = "block";

  // edycja tablicy tylko dla nauczyciela
  if (USER_ROLE === "nauczyciel") {
    textarea.disabled = false;
    textarea.placeholder = "Nauczyciel – możesz pisać na tablicy...";
  } else {
    textarea.disabled = true;
    textarea.placeholder = "Tylko nauczyciel może edytować tablicę";
  }
}


// ==========================
//   POBIERANIE TABLICY
// ==========================
async function loadBoard() {
  if (!getToken()) return;

  try {
    const res = await fetch(`${API_URL}/board`, {
      headers: { Authorization: "Bearer " + getToken() },
    });

    const data = await res.json();
    if (!res.ok) return;

    textarea.value = data.content || "";
  } catch (err) {
    console.error("Błąd loadBoard:", err);
  }
}

// ==========================
//     ZAPIS TABLICY
// ==========================
let saveTimeout;
textarea?.addEventListener("input", () => {
  if (USER_ROLE !== "nauczyciel") return; // uczeń NIE może zapisywać

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveBoard, 1000);
});

async function saveBoard() {
  if (USER_ROLE !== "nauczyciel") return;

  try {
    const res = await fetch(`${API_URL}/board`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify({ content: textarea.value }),
    });

    if (res.ok) showSaveMessage("Zapisano ✔️");
  } catch (err) {
    showSaveMessage("❌ Błąd zapisu");
  }
}

// ==========================
//   MAŁY TOAST "Zapisano"
// ==========================
function showSaveMessage(msgText) {
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

// ==========================
//        CHAT
// ==========================
const chatBox = document.querySelector(".chat > div");
const chatInput = document.querySelector(".chat input");
const chatBtn = document.querySelector(".chat button");
let lastMessageId = 0;

async function loadMessages() {
  if (!getToken()) return;

  try {
    const res = await fetch(`${API_URL}/messages?last_id=${lastMessageId}`, {
      headers: { Authorization: "Bearer " + getToken() },
    });

    const data = await res.json();
    if (!res.ok) return;

    data.forEach((msg) => {
      const div = document.createElement("div");
      div.innerHTML = `<strong>${msg.name}:</strong> ${msg.text}`;
      chatBox.appendChild(div);
      lastMessageId = msg.id;
      chatBox.scrollTop = chatBox.scrollHeight;
    });
  } catch (err) {}
}

async function sendMessage() {
  if (!getToken()) return;

  const text = chatInput.value.trim();
  if (!text) return;

  const res = await fetch(`${API_URL}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + getToken(),
    },
    body: JSON.stringify({ text }),
  });

  if (res.ok) {
    chatInput.value = "";
    loadMessages();
  }
}

chatBtn?.addEventListener("click", sendMessage);
chatInput?.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

setInterval(loadMessages, 2000);

// ==========================
//         NOTATKA
// ==========================
const noteArea = document.querySelector(".notatka-textarea");
let noteSaveTimeout;

async function loadNote() {
  if (!getToken()) return;

  try {
    const res = await fetch(`${API_URL}/notes`, {
      headers: { Authorization: "Bearer " + getToken() },
    });

    const data = await res.json();
    if (res.ok) noteArea.value = data.content || "";
  } catch (err) {}
}

noteArea?.addEventListener("input", () => {
  clearTimeout(noteSaveTimeout);
  noteSaveTimeout = setTimeout(saveNote, 1000);
});

async function saveNote() {
  if (!getToken()) return;

  try {
    await fetch(`${API_URL}/notes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + getToken(),
      },
      body: JSON.stringify({ content: noteArea.value }),
    });

    showSaveMessage("Zapisano ✔️");
  } catch (err) {
    showSaveMessage("❌ Błąd zapisu");
  }
}

// ==========================
//     PIERWSZE URUCHOMIENIE
// ==========================
updateRole();
applyPermissions();
if (getToken()) {
  loadBoard();
  loadNote();
  loadMessages();
}   
const activeList = document.getElementById("activeList");

async function loadActiveUsers() {
    if (!getToken()) return;

    try {
        const res = await fetch(`${API_URL}/active`, {
            headers: { Authorization: "Bearer " + getToken() }
        });

        const users = await res.json();
        if (!Array.isArray(users)) return;

        activeList.innerHTML = "";
        users.forEach(u => {
            const div = document.createElement("div");
            div.textContent = `${u.name} (${u.role})`;
            activeList.appendChild(div);
        });

    } catch (err) {
        console.error("Błąd loadActiveUsers:", err);
    }
}
setInterval(loadActiveUsers, 5000);
loadActiveUsers();
