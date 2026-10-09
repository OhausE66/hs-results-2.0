# Tool-Review: Kultur (`pages/CultureScanner.tsx`)

## 1. Ablauf in Schritten

1. **Landing:** Die Seite erklärt den Culture Scan und führt über „Culture-Scan Starten“ in den Setup-Schritt. Die Landing-Texte werden über `LanguageContext` übersetzt.
2. **Kontext:** `OrgContextForm` erfasst Profilname, Organisationsgröße, Gründungsjahr, Branche, Innovationskraft, Wirtschaftlichkeit und Hauptproblem. Angemeldete Nutzer können Profile laden oder speichern. Das Formular ist ein eigener vorgelagerter Eingabeschritt.
3. **Geschichten:** Der Nutzer beschreibt Erfolg, Umgang mit Fehlern und Konflikte. Für den nächsten Schritt sind nur Erfolg und Fehler verpflichtend; Konflikte werden nicht validiert. Die drei Textfelder sind fest auf Deutsch beschriftet und nicht über `t(...)` übersetzt.
4. **KI-Aufruf 1 – Hypothesen:** `generateCultureHypotheses(fullContext, language)` ruft über `geminiService.ts` `gemini-3.1-pro-preview` mit JSON-Ausgabe auf. Bei Erfolg entstehen drei Hypothesen mit Begründung; die Bewertungsslider starten jeweils bei 3.
5. **Hypothesenbewertung:** Der Nutzer bewertet jede Hypothese von 1 bis 5. Der Button startet den nächsten KI-Aufruf; währenddessen wird nur ein Spinner angezeigt.
6. **KI-Aufruf 2 – Zielrichtungen:** `generateCultureGoals(...)` sendet Geschichten, Kontext und Ratings an dasselbe Pro-Modell. Drei dynamische Zielrichtungen werden angezeigt; eine muss ausgewählt werden.
7. **KI-Aufruf 3 – Analyseplan:** `generateCultureAnalysisPlan(...)` sendet Geschichten, Ratings, Zielrichtung und Sprache. Das Ergebnis enthält Profil, Shadow Culture, Stärken, Hebel, Interventionen und einen 6-Wochen-Plan.
8. **Login und Ergebnis:** Erst nach erfolgreicher Analyse wird `step` auf `RESULT` gesetzt. Bei nicht eingeloggten Nutzern rendert die Seite dort `Auth inline`; die bereits erzeugte Analyse bleibt bis zum Login unsichtbar. Eingeloggte Nutzer sehen das Ergebnis, können es speichern oder als TXT herunterladen.

## 2. Befunde

| Befund | Wirkung auf Nutzer | Vorschlag | Aufwand | Geteilte Datei? |
|---|---|---|---|---|
| **K1 – Login-Wall nach der Arbeit und nach dem letzten KI-Aufruf.** Die Prüfung `if (!user) return <Auth ...>` steht erst in `renderResult`; die Analyse wird vorher erzeugt. | Hoher Frust: Der Nutzer investiert Setup, drei Freitexte, Hypothesenbewertungen und Wartezeit, bevor klar wird, dass das Ergebnis nur nach Login sichtbar ist. | Vor dem ersten KI-Aufruf oder spätestens vor `generateFinal` transparent erklären, was ohne Login sichtbar bleibt; Produktentscheidung zu Vorschau/Login-Wall gemäß B1. | mittel | nein |
| **K2 – Drei KI-Wartephasen ohne Fortschrittsanzeige.** `loading`, `loadingGoals` und `loading` zeigen jeweils nur Spinner bzw. „Hypothesen generieren“, „Zielrichtungen finden“ oder „Finalen ... erstellen“. `AiWaiting` wird nicht verwendet. | Bei `gemini-3.1-pro-preview` ist die Wartezeit voraussichtlich spürbar; der Nutzer weiß weder, ob die Anfrage läuft noch wie viele Schritte noch fehlen. | `AiWaiting` nach Phase 0 für Hypothesen, Zielrichtungen und Analyseplan einsetzen; je Aufruf eigene Statusmeldungen und Dauerhinweis verwenden. Modell-/Latenzentscheidung getrennt messen. | klein | nein |
| **K3 – KI-Fehler bleiben teilweise unsichtbar.** `apiError` wird gesetzt, aber nirgends gerendert. Bei leerem/unerwartetem Ergebnis bleibt der Nutzer auf der Eingabemaske; bei Fehler der Zielrichtungen ebenfalls ohne sichtbare Erklärung. | Nutzer kann nicht unterscheiden, ob Eingaben fehlen, die KI läuft oder der Dienst ausgefallen ist; ein Wiederholen ist nicht klar angeboten. | Fehlerbanner oder Inline-Fehler mit „Erneut versuchen“, Fehlerzustand pro KI-Schritt und Beibehaltung der Eingaben ergänzen. | klein | nein |
| **K4 – Sprachmischung im Kultur-Flow.** `language` wird an die KI übergeben, aber viele sichtbare Texte sind hartcodiert auf Deutsch: Stories, Hypothesen-/Ziel-Überschriften, Buttons, Ergebnislabels, Save-/Download-Texte und Fehlermeldungen. Auch `OrgContextForm` enthält mehrere hartcodierte deutsche Labels/Optionen trotz vorhandener Sprachlogik. | Bei englischer UI entstehen englische Landing-/Kontexttexte neben deutschen Formularen und Ergebniskarten; das wirkt unfertig und kann die Interpretation der Fragen beeinflussen. | Alle sichtbaren Texte dieses Flows über bestehende/neue Übersetzungsschlüssel führen; Sprache der KI-Ausgabe und UI-Sprache gemeinsam prüfen. Änderung betrifft dann `LanguageContext.tsx` als geteilte Datei. | mittel | ja |
| **K5 – Eingabeanforderung ist nicht konsistent.** Der Button verlangt Erfolg und Fehler, aber nicht Konflikte; Mindestlängen oder Beispielantworten werden nicht angezeigt. | Nutzer können mit unvollständigem Kulturbild weitergehen; zugleich ist unklar, wie ausführlich die Geschichten sein sollen. | Pflichtlogik und kurze Erwartung pro Feld sichtbar machen; Konfliktfeld entweder verpflichtend machen oder ausdrücklich optional kennzeichnen. | klein | nein |
| **K6 – Ergebnis ist reichhaltig, aber ohne expliziten nächsten digitalen Schritt.** Es gibt Download, Speichern und eine Kontakt-Mail, aber keinen klaren CTA zu Erstgespräch, passendem Folge-Tool oder konkretem nächsten Arbeitsschritt außerhalb des generierten 6-Wochen-Plans. | Der Bericht kann als Endpunkt wirken; die Brücke vom Selbsttest in ein skalierbares Beratungsangebot bleibt schwach. | Einen klaren nächsten CTA ergänzen, z. B. „Erstgespräch vereinbaren“ plus passender Tool-/Kontaktoption; mit der gemeinsamen Produktentscheidung zu B6 abstimmen. | klein | nein |
| **K7 – Der Zurück-Button setzt den gesamten Flow auf Landing zurück.** Beim Verlassen eines späteren Schritts werden Analyse und Fehler zurückgesetzt. | Korrekturen an Kontext, Geschichten oder Ratings kosten den Nutzer den bisherigen Fortschritt. | Schrittbezogene Navigation oder wenigstens „Zurück zu ...“ mit Erhalt der State-Daten; Reset separat anbieten. | mittel | nein |

## 3. Prioritäten (Top 3)

1. **K1/B1:** Login-Wall vor der teuren Erwartungslücke klären und eine sichtbare Vorschau-/Login-Kommunikation definieren.
2. **K2/B2:** Alle drei Wartezustände mit `AiWaiting` und verständlichen Schritttexten ausstatten; danach Latenz des Pro-Modells messen.
3. **K3/K4:** Fehler sichtbar machen und die Sprachmischung im gesamten Kultur-Flow bereinigen; für K4 ist `LanguageContext.tsx` als geteilte Datei betroffen.

## 4. Prüfung gegen B1–B6 und `AiWaiting`

| Befund aus WORKSTREAMS | Kultur-Bewertung |
|---|---|
| **B1 Login-Wall** | **Trifft zu.** Die Login-Prüfung erfolgt erst in `renderResult`, also nach allen Eingaben und dem finalen KI-Aufruf. Sichtbarer Umfang der Live-Login-Ansicht: **zu prüfen im Live-Test**. |
| **B2 Wartezeit** | **Trifft zu.** Drei KI-Aufrufe nutzen `gemini-3.1-pro-preview`; angezeigt werden nur Spinner/Buttontexte. Tatsächliche Dauer: **zu prüfen im Live-Test**. |
| **B3 doppelte Masken** | **Teilweise relevant.** Es gibt den separaten `OrgContextForm`-Schritt und danach die Stories-Maske. Das ist fachlich nicht dieselbe Frage, aber der Übergang erzeugt zwei aufeinanderfolgende Eingabemasken; UX-Bedarf **zu prüfen im Live-Test**. |
| **B4 lange Fragen** | **Kein direkter Codebefund für Kultur.** Die Stories-Fragen sind kurz, die Freitextfelder groß; ob Labels/Platzhalter Antworten aus dem Bild schieben, ist **zu prüfen im Live-Test**. |
| **B5 Markdown** | **Nicht erkennbar.** Kultur rendert strukturierte JSON-Felder als Text/Listen und verarbeitet kein Markdown. KI-Inhalte können dennoch Formatierungszeichen enthalten; **zu prüfen im Live-Test**. |
| **B6 nächster Schritt** | **Teilweise trifft zu.** Es gibt 6-Wochen-Maßnahmen und eine Kontakt-Mail, aber keinen klaren primären Folge-CTA wie Erstgespräch oder passendes Tool. |
| **`components/AiWaiting.tsx`** | **Passt gut nach Phase 0.** Die Komponente unterstützt wechselnde Statusmeldungen, `aria-live` und einen Dauerhinweis und kann die drei vorhandenen Spinner-Zustände ersetzen. Sie zeigt keinen echten Prozentfortschritt; eine Umbenennung der Meldungen in „Schritt 1 von 3“ wäre sinnvoll. |

