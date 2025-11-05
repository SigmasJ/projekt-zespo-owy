const API_URL = "http://10.103.8.115/projekt-zespo-owy/api.php"; // Twój endpoint API
const form = document.getElementById('loginForm');
const status = document.getElementById('status');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      status.innerText = data.error || 'Nie udało się zalogować';
      return;
    }

    localStorage.setItem('jwt', data.token); // zapis tokenu w localStorage
    status.innerText = 'Zalogowano pomyślnie!';
  } catch (err) {
    console.error(err);
    status.innerText = 'Błąd połączenia';
  }
});

// Funkcja do pobrania danych użytkownika z tokenu (frontend)
function parseJWT(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

// Przykład użycia
const savedToken = localStorage.getItem('jwt');
if (savedToken) {
  const userData = parseJWT(savedToken);
  if (userData) {
    console.log('Zalogowany użytkownik:', userData);
  }
}

const textarea = document.querySelector('.tablica-textarea');
const token = localStorage.getItem('jwt'); // token z logowania

// 🟦 Funkcja do pobrania treści tablicy
async function loadBoard() {
  try {
    const res = await fetch('/api/board', {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    });
    if (res.ok) {
      const data = await res.json();
      textarea.value = data.content || '';
    } else {
      console.error('Nie udało się pobrać tablicy');
    }
  } catch (err) {
    console.error('Błąd połączenia:', err);
  }
}

// 🟩 Autozapis po przerwaniu pisania
let saveTimeout;
textarea?.addEventListener('input', () => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(saveBoard, 1000); // zapis po 1s bezczynności
});

// 🟨 Funkcja zapisująca tablicę
async function saveBoard() {
  try {
    const res = await fetch('/api/board', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({ content: textarea.value })
    });

    const data = await res.json();
    if (res.ok) {
      console.log('✅ Tablica zapisana');
      showSaveMessage();
    } else {
      console.warn('❌ Błąd zapisu:', data.error);
    }
  } catch (err) {
    console.error('Błąd zapisu:', err);
  }
}

// 🟦 Mały wichajster — komunikat „Zapisano ✅”
function showSaveMessage() {
  let msg = document.querySelector('.save-toast');
  if (!msg) {
    msg = document.createElement('div');
    msg.className = 'save-toast';
    msg.textContent = 'Zapisano ✅';
    document.body.appendChild(msg);
  }
  msg.style.opacity = '1';
  setTimeout(() => (msg.style.opacity = '0'), 1500);
}

// Start: załaduj zawartość tablicy
loadBoard();