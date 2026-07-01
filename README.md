**Aplikacja do analizy danych genomowych**

Spis treści
1.	Ogólny zarys projektu
2.	Instrukcja użytkownika końcowego
a.	Użytkownik bez praw administracyjnych
b.	Użytkownik z prawami administracyjnymi
3.	Dokumentacja techniczna
a.	Bazy danych
b.	Frontend
c.	Backend

1.	Ogólny zarys projektu
Aplikacja służy do wizualizacji i porównywania danych dotyczących genomów różnych podgatunków za pomocą kilku typów wykresu: liniowego, punktowego i słupkowego. Dane dotyczące różnych genomów powinny być widoczne jednocześnie na jednej planszy wykresu co ułatwia analizę. 
Interfejs umieszczony powyżej wykresu pozwala wybrać typ danych, którym użytkownik jest zainteresowany, a także które podgatunki chce porównać. Możliwe jest porównanie ze sobą naraz maksymalnie dwóch podgatunków.
Ponadto, zalogowani użytkownicy mogą dodawać własne dane poprzez załadowanie ich przez stronę w formie pliku .csv. Zalogowani użytkownicy, ze względu na dużą autonomię w edycji zawartości wykresu, powinni być osobami autoryzowanymi i zaznajomionymi z projektem oraz badaniami genomowymi. W dalszej części opisu będą oni określani jako użytkownicy z prawami administracyjnymi lub admini.
2.	Instrukcja użytkownika końcowego

a)	Użytkownik bez praw administracyjnych

Zwykli użytkownicy mogą wyświetlać wizualizacje zasobów już istniejących w bazie danych, lecz nie mogą sami dodać żadnych nowych danych. Użytkownik niezalogowany może korzystać z interfejsu strony w następujący sposób:
- wybrać z menu na górze strony interesujący go podgatunek/podgatunki; wybranie podwójnie tego samego gatunku wyświetli jeden wykres
- wybrać interesujące go dane do wyświetlenia na osi X oraz Y. Do wyboru na osi X znajdują się wszystkie możliwe typy danych zawarte w bazie danych w tabeli genów (genes) poza haszem użytkownika, domyślnie są to:
•	Symbol genu (gene_symbol),
•	Część proteinowa (protein_role),
•	Lokacja chromosomu (chromosomal_location),
•	Koncentracja protein (protein concentration),
•	Czystość protein (protein_purity),
•	Podgatunki (subspecies)
Z kolei dla osi Y, są to kategorie interpretowane jako dane liczbowe :
•	Część proteinowa (protein_role),
•	Lokacja chromosomu (chromosomal_location),
•	Koncentracja protein (protein concentration),
•	Czystość protein (protein_purity)
Taki wybór jest spowodowany ograniczeniami wykresów udostępnionych na stronie. Żeby ograniczyć ryzyko błędów, dane o wartościach innych niż liczbowe, nie mogą być wyświetlane na osi Y.
b)	Użytkownik z prawami administracyjnymi

Użytkownik z prawami administracyjnymi tzw. admin może zalogować się żeby samodzielnie dodać własne dane do bazy danych i wyświetlić je na wykresie.  Zalogować można się za pomocą przycisku Zaloguj się umieszczonego w prawej górnej części strony. Kliknięcie go spowoduje przekierowanie na podstronę przeznaczoną do logowania. 
Domyślnie jedynym istniejącym loginem jest admin, a powiązanym hasłem root.
Po zalogowaniu się, użytkownik zobaczy ukrytą wcześniej część interfejsu, oraz instrukcję na dole strony wyjaśniającą korzystanie z niego. Interfejs ów umożliwia dodanie nowego właściciela danych, obiektu badań z którego pobrano sample. Należy upewnić się, że właściciel zostaje dodany przez próbą umieszczenia należących do niego danych do bazy. Można to zrobić poprzez wpisanie nazwy nowego właściciela do odpowiedniego pola i kliknięcia przycisku „Dodaj”. Dane owe zostaną automatycznie zahaszowane po dodaniu do bazy. Następnie można dodać powiązane dane genomowe w formie pliku .csv. Służy do tego osobny przycisk na górze strony. Kluczowym jest, by dane były kompatybilne z pozostałymi danymi istniejącymi w bazie. Odpowiedzialność ta spoczywa na administratorze i dlatego tylko wybrane osoby powinny mieć prawo do logowania.
Domyślny porządek danych to: 
•	Symbol genu (gene_symbol),
•	Hasz właściciela (owner_hashcode),
•	Część proteinowa (protein_role),
•	Lokacja chromosomu (chromosomal_location),
•	Koncentracja protein (protein concentration),
•	Czystość protein (protein_purity),
•	Podgatunki (subspecies)
Warto zwrócić uwagę, że wszystkie te dane, poza symbolem genu, haszem i podgatunkami to dane liczbowe. Wymienione zaś wcześniej to dane w formacie tekstowym (string).
Użytkownik może wylogować się używając przycisku w prawym górnym rogu ekranu, lecz zostanie też automatycznie wylogowany po 15 minutach nieaktywności.
3.	Dokumentacja techniczna

a.	Bazy danych
Aplikacja korzysta z dwóch baz danych: jednej do przechowywania danych genomowych, druga do przechowywania loginu i hasła adminów.
Ta pierwsza jest bazą stworzoną w języku SQL i korzysta z serwera MySQL.
•	Tabela owners przechowuje właścicieli (hash + nazwa).
•	Tabela genes przechowuje dane genomowe, powiązane z właścicielem i podgatunkiem.


Druga jest bazą funkcjonującą w chmurze za pomocą systemu MongoDB. Domyślnie dostęp do bazy Mongo jest możliwy z każdego możliwego adresu IP. Kolekcja admins w bazie gen_admins przechowuje dane logowania użytkowników.

b.	Backend
Architektura i technologie
•	Flask – główny framework webowy.
•	MySQL – baza relacyjna przechowująca dane genomowe i właścicieli.
•	MongoDB (Atlas) – baza dokumentowa do przechowywania danych logowania użytkowników.
•	Pandas – do przetwarzania plików CSV.
•	bcrypt – do bezpiecznego haszowania haseł.
•	Session – do zarządzania sesją użytkownika i automatycznego wylogowania po 15 minutach braku aktywności.
Główne endpointy
•	/
Strona główna aplikacji, renderuje szablon page.html.
•	/login
Obsługa logowania użytkownika (GET/POST). Sprawdza dane w MongoDB, ustawia sesję.
•	/logout
Wylogowanie użytkownika, usuwa dane z sesji.
•	/register
Rejestracja nowego użytkownika (MongoDB).
•	upload
Przyjmuje plik CSV, waliduje i zapisuje dane do tabeli genes w MySQL. Po przetworzeniu plik jest usuwany z serwera.
•	/owner-input
Dodaje nowego właściciela do tabeli owners w MySQL (z generowaniem hasza), po uprzednim sprawdzeniu czy taki właściciel już istnieje.
•	/subspecies-list
Zwraca listę unikalnych podgatunków z tabeli genes (JSON).
•	/column-list-for-x, /column-list-for-y
Zwracają listy kolumn z tabeli genes odpowiednio dla osi X i Y (JSON). Dla Y zwracane są tylko kolumny numeryczne.
•	/chart-data
Zwraca dane do wykresu na podstawie wybranych kolumn i podgatunków (JSON).
Obsługa sesji i bezpieczeństwo
•	Sesja użytkownika jest trwała przez 15 minut od ostatniej aktywności (app.permanent_session_lifetime).
•	Dostęp do wybranych endpointów (np. upload, owner-input) wymaga zalogowania.
•	Hasła użytkowników są przechowywane w MongoDB w postaci haszowanej (bcrypt).
•	Przesyłane pliki CSV są walidowane pod kątem wymaganych kolumn.
c. Frontend
Panel logowania
•	Strona logowania (login.html) posiada efekt "glassmorphism", nowoczesną kolorystykę oraz ikonę DNA.
•	Po zalogowaniu użytkownik uzyskuje dostęp do funkcji związanych z zarządzaniem danymi.
Główna strona aplikacji
•	Nagłówek z nazwą aplikacji oraz dynamicznie wyświetlanymi przyciskami logowania/wylogowania (w zależności od statusu sesji).
•	Formularze dostępne tylko dla zalogowanych użytkowników:
o	Dodawanie nowego właściciela próbek (pole tekstowe + przycisk).
o	Wysyłanie pliku .csv z danymi genomowymi.
•	Sekcja wyboru podgatunków – dwa rozwijane menu pozwalają wybrać podgatunki do porównania na wykresie.
•	Wybór typu wykresu – użytkownik może jednym kliknięciem przełączać się między wykresem liniowym, słupkowym, punktowym (scatter) oraz słupkowym.
•	Toolbar do wyboru kolumn – rozwijane listy pozwalają wybrać kolumny z bazy danych, które będą prezentowane na osiach X i Y wykresu.
•	Wizualizacja danych – wykres generowany jest dynamicznie w oparciu o wybrane parametry, z użyciem Chart.js. Wspierane są różne typy wykresów, a dane są pobierane asynchronicznie z backendu.
•	Sekcja informacyjna – wyświetla wskazówki dotyczące poprawnego dodawania danych oraz obsługi aplikacji.
•	Stopka z informacją o prawach autorskich.
Wygląd i UX
•	Całość utrzymana jest w jasnej, przyjaznej kolorystyce z delikatnymi animacjami i efektami cieniowania.
•	Formularze i przyciski są zaokrąglone, czytelne i wygodne w obsłudze.
•	Interfejs jest responsywny i dostosowany do różnych rozdzielczości ekranu.
Obsługa zdarzeń i dynamiczność
•	Wybór typu wykresu, kolumn oraz podgatunków powoduje natychmiastową aktualizację wykresu bez przeładowania strony.
•	Wysyłka plików i formularzy odbywa się w sposób bezpieczny, z walidacją po stronie frontendu i backend.

                             


