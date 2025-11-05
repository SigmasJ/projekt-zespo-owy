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