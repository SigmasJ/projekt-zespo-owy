# Projekt Zespołowy — Podsumowanie repozytorium

Ten dokument powstał po przeanalizowaniu zawartości repozytorium SigmasJ/projekt-zespo-owy. Zawiera opis projektu, strukturę plików, wskazówki uruchomienia, konfiguracji bazy danych oraz najważniejsze pliki i zalecenia bezpieczeństwa.

## Krótkie podsumowanie
Repozytorium to prosty projekt webowy wykorzystujący PHP na backendzie oraz HTML/CSS/JS na frontendzie. Zawiera REST-owy punkt końcowy API (api.php), obsługę JWT (jwt.php), skrypt bazy danych (czatonotatnik.sql) oraz statyczne pliki frontendu (index.html, js.js, css.css). W repo jest też kilka pomocniczych plików i katalogów (modules/, tester/).

Język dominujący: PHP

## Główne cechy
- Backend w PHP z prostym API (api.php)
- Autoryzacja/tokeny JWT (jwt.php)
- Skrypt SQL do utworzenia bazy/tabel (czatonotatnik.sql)
- Frontend: index.html + js.js + css.css
- Plik db.php do konfiguracji połączenia z bazą danych

## Struktura repozytorium (pliki i krótkie opisy)
- README.md — ten plik (aktualizacja przygotowana na podstawie analizy repo).
- TODO.txt — lista rzeczy do zrobienia / notatki deweloperskie.
- api.php — główny punkt końcowy API (obsługa żądań HTTP).
  URL: https://github.com/SigmasJ/projekt-zespo-owy/blob/main/api.php
- jwt.php — obsługa JWT / generowanie i weryfikacja tokenów.
  URL: https://github.com/SigmasJ/projekt-zespo-owy/blob/main/jwt.php
- db.php — konfiguracja połączenia z bazą danych (host, użytkownik, hasło, nazwa DB).
  URL: https://github.com/SigmasJ/projekt-zespo-owy/blob/main/db.php
- czatonotatnik.sql — skrypt SQL do stworzenia bazy/tabel i przykładowych danych.
  URL: https://github.com/SigmasJ/projekt-zespo-owy/blob/main/czatonotatnik.sql
- index.html — główny interfejs użytkownika (frontend).
  URL: https://github.com/SigmasJ/projekt-zespo-owy/blob/main/index.html
- js.js — logika frontendu (JavaScript).
  URL: https://github.com/SigmasJ/projekt-zespo-owy/blob/main/js.js
- css.css — arkusz stylów.
  URL: https://github.com/SigmasJ/projekt-zespo-owy/blob/main/css.css
- tester.html — pomocniczy plik do testowania (frontend).
  URL: https://github.com/SigmasJ/projekt-zespo-owy/blob/main/tester.html
- tester/ — katalog testowy (zawartość katalogu).
  URL: https://github.com/SigmasJ/projekt-zespo-owy/tree/main/tester
- modules/ — katalog na moduły (obecnie pusty / miejsce na rozszerzenia).
  URL: https://github.com/SigmasJ/projekt-zespo-owy/tree/main/modules
- dosql.txt — plik pomocniczy z instrukcjami/komendami SQL (zawartość).
  URL: https://github.com/SigmasJ/projekt-zespo-owy/blob/main/dosql.txt
- hasla.txt — (UWAGA: możliwe, że zawiera przykładowe hasła). Sprawdź usunąć lub zabezpieczyć!
  URL: https://github.com/SigmasJ/projekt-zespo-owy/blob/main/hasla.txt

## Wymagania (przykładowe)
- PHP 7.4+ (lub nowsze)
- Serwer WWW (Apache/Nginx) z obsługą PHP lub PHP built-in server
- MySQL/MariaDB (do zaimportowania czatonotatnik.sql)
- (Opcjonalnie) narzędzia: mysql klient do importu skryptu SQL

## Konfiguracja / ważne wskazówki bezpieczeństwa
- Nigdy nie zostawiaj w repozytorium rzeczywistych haseł ani kluczy. Jeśli pliki takie jak hasla.txt zawierają hasła testowe, usuń je przed publicznym udostępnieniem.
- Sekret JWT powinien być generowany losowo i przechowywany bezpiecznie (np. w zmiennej środowiskowej, pliku konfiguracyjnym poza rootem web).
- Ogranicz prawa użytkownika bazy danych (nie używaj root w produkcji).
- Waliduj i oczyszczaj dane wejściowe po stronie serwera (ochrona przed SQL injection, XSS).
- Jeśli projekt trafi do produkcji, rozważ użycie HTTPS.

## Pliki do sprawdzenia w pierwszej kolejności
- db.php — ustawienia połączenia z DB
- czatonotatnik.sql — struktura bazy i przykładowe dane
- jwt.php — konfiguracja tokenów (sekret, expiration)
- api.php — mapowanie endpointów, sposób komunikacji front↔back
- index.html, js.js — front i przykłady użycia API
