# Aplikacja do analizy danych genomowych

## Spis treści

1. [Ogólny zarys projektu](#1-ogólny-zarys-projektu)
2. [Instrukcja użytkownika końcowego](#2-instrukcja-użytkownika-końcowego)
   - [2.1 Użytkownik bez praw administracyjnych](#21-użytkownik-bez-praw-administracyjnych)
   - [2.2 Użytkownik z prawami administracyjnymi](#22-użytkownik-z-prawami-administracyjnymi)
3. [Dokumentacja techniczna](#3-dokumentacja-techniczna)
   - [3.1 Bazy danych](#31-bazy-danych)
   - [3.2 Backend](#32-backend)
   - [3.3 Frontend](#33-frontend)

---

# 1. Ogólny zarys projektu

Aplikacja służy do **wizualizacji i porównywania danych genomowych** różnych podgatunków za pomocą kilku typów wykresów:

- liniowego,
- punktowego,
- słupkowego.

Dane dotyczące różnych genomów mogą być wyświetlane jednocześnie na jednym wykresie, co ułatwia analizę i porównanie wyników.

Interfejs znajdujący się nad wykresem umożliwia użytkownikowi:

- wybór typu danych wyświetlanych na osiach,
- wybór podgatunków do porównania.

Jednocześnie można porównywać maksymalnie **dwa podgatunki**.

Zalogowani użytkownicy mogą dodawać własne dane poprzez przesłanie pliku **CSV**. Ze względu na możliwość modyfikacji zawartości bazy danych funkcja ta jest dostępna wyłącznie dla użytkowników posiadających uprawnienia administracyjne.

---

# 2. Instrukcja użytkownika końcowego

## 2.1 Użytkownik bez praw administracyjnych

Niezalogowany użytkownik może przeglądać dane znajdujące się w bazie, jednak nie może dodawać nowych rekordów.

### Dostępne funkcje

- wybór jednego lub dwóch podgatunków do porównania,
- wybór danych wyświetlanych na osiach wykresu,
- zmiana typu wykresu.

> Wybranie tego samego podgatunku dwukrotnie spowoduje wyświetlenie tylko jednego zestawu danych.

### Dostępne kolumny dla osi X

- Symbol genu (`gene_symbol`)
- Część proteinowa (`protein_role`)
- Lokalizacja chromosomu (`chromosomal_location`)
- Koncentracja protein (`protein_concentration`)
- Czystość protein (`protein_purity`)
- Podgatunek (`subspecies`)

### Dostępne kolumny dla osi Y

Na osi Y mogą być prezentowane wyłącznie dane liczbowe:

- Część proteinowa (`protein_role`)
- Lokalizacja chromosomu (`chromosomal_location`)
- Koncentracja protein (`protein_concentration`)
- Czystość protein (`protein_purity`)

Ograniczenie to wynika z wymagań wykresów wykorzystywanych przez aplikację.

---

## 2.2 Użytkownik z prawami administracyjnymi

Administrator posiada wszystkie możliwości użytkownika standardowego oraz dodatkowo może:

- logować się do systemu,
- dodawać nowych właścicieli danych,
- importować dane genomowe z plików CSV.

### Logowanie

Logowanie odbywa się za pomocą przycisku **„Zaloguj się”** znajdującego się w prawym górnym rogu strony.

Domyślne dane logowania:

| Login | Hasło |
|-------|-------|
| `admin` | `root` |

### Dodawanie właściciela

Przed importem danych należy dodać właściciela próbek.

Procedura:

1. wpisać nazwę właściciela,
2. kliknąć **Dodaj**,
3. aplikacja automatycznie wygeneruje hash właściciela i zapisze go w bazie danych.

### Import danych

Po dodaniu właściciela można przesłać plik **CSV** zawierający dane genomowe.

Plik powinien zawierać kolumny w następującej kolejności:

1. `gene_symbol`
2. `owner_hashcode`
3. `protein_role`
4. `chromosomal_location`
5. `protein_concentration`
6. `protein_purity`
7. `subspecies`

### Typy danych

**Tekstowe**

- `gene_symbol`
- `owner_hashcode`
- `subspecies`

**Numeryczne**

- `protein_role`
- `chromosomal_location`
- `protein_concentration`
- `protein_purity`

Administrator odpowiada za poprawność i zgodność importowanych danych z istniejącą strukturą bazy.

### Wylogowanie

Administrator może:

- wylogować się ręcznie,
- zostać automatycznie wylogowany po **15 minutach bezczynności**.

---

# 3. Dokumentacja techniczna

## 3.1 Bazy danych

Aplikacja wykorzystuje dwie niezależne bazy danych.

### Baza genomowa (MySQL)

Relacyjna baza danych przechowująca dane genomowe.

#### Tabela `owners`

Przechowuje informacje o właścicielach próbek:

- hash właściciela,
- nazwa właściciela.

#### Tabela `genes`

Przechowuje:

- dane genomowe,
- powiązanie z właścicielem,
- podgatunek.

---

### Baza administratorów (MongoDB Atlas)

Baza dokumentowa przechowująca dane logowania administratorów.

Domyślnie baza dostępna jest z dowolnego adresu IP.

#### Baza

`gen_admins`

#### Kolekcja

`admins`

Przechowuje:

- login,
- zahaszowane hasło.

---

## 3.2 Backend

### Technologie

- Flask
- MySQL
- MongoDB Atlas
- Pandas
- bcrypt
- Flask Session

### Endpointy

| Endpoint | Opis |
|----------|------|
| `/` | Strona główna aplikacji |
| `/login` | Logowanie użytkownika |
| `/logout` | Wylogowanie użytkownika |
| `/register` | Rejestracja administratora |
| `/upload` | Import pliku CSV |
| `/owner-input` | Dodanie nowego właściciela |
| `/subspecies-list` | Lista dostępnych podgatunków |
| `/column-list-for-x` | Lista kolumn dla osi X |
| `/column-list-for-y` | Lista kolumn dla osi Y |
| `/chart-data` | Dane wykresu w formacie JSON |

### Bezpieczeństwo

- sesja wygasa po **15 minutach** nieaktywności,
- wybrane endpointy wymagają zalogowania,
- hasła przechowywane są jako hash (`bcrypt`),
- pliki CSV są walidowane przed importem.

---

## 3.3 Frontend

### Panel logowania

Strona logowania (`login.html`) zawiera:

- nowoczesny wygląd (glassmorphism),
- ikonę DNA,
- formularz logowania.

Po zalogowaniu użytkownik uzyskuje dostęp do funkcji administracyjnych.

---

### Strona główna

Interfejs zawiera:

- nagłówek z nazwą aplikacji,
- przyciski logowania i wylogowania,
- formularz dodawania właściciela,
- formularz przesyłania plików CSV,
- wybór dwóch podgatunków,
- wybór typu wykresu,
- wybór kolumn dla osi X i Y,
- dynamiczny wykres oparty o Chart.js,
- sekcję pomocy,
- stopkę z informacją o prawach autorskich.

---

### Typy wykresów

Aplikacja obsługuje:

- wykres liniowy,
- wykres punktowy (scatter),
- wykres słupkowy.

---

### Wygląd i UX

Interfejs został zaprojektowany z naciskiem na:

- responsywność,
- prostotę obsługi,
- nowoczesny wygląd,
- czytelne formularze,
- delikatne animacje.

---

### Dynamiczne działanie

Aplikacja wykorzystuje komunikację asynchroniczną z backendem.

Zmiana:

- typu wykresu,
- podgatunku,
- kolumn,

powoduje natychmiastowe odświeżenie wykresu bez przeładowania strony.

Przesyłanie formularzy oraz plików CSV jest walidowane zarówno po stronie frontendu, jak i backendu.
