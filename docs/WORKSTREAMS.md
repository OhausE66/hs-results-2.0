# Workstreams: Claude und Codex an hs-results-2.0

Stand: 2026-10-09 · Status: **Vorschlag, wartet auf Abstimmung (Olaf + Codex)**

Ziel: Die AI-Funktionen von hs-results.com verbessern. Jeder Agent arbeitet an genau einem Tool, in kleinen PRs. Die einzige Wahrheit ist `main`.

## 1. Ausgangslage (Test vom 2026-10-08)

Getestet wurden Organisations-Audit und Chat (Resulta) auf hs-results.com. Die übrigen fünf Tools wurden noch nicht getestet.

Befunde:

| # | Befund | Betrifft |
|---|---|---|
| B1 | Ergebnis liegt hinter Login-Wall, ohne Vorschau. Nutzer erfahren das erst nach ca. 4 Minuten Arbeit. | Alle Tools mit `Auth` |
| B2 | Wartezeit 15–25 s pro Schritt, nur "KI analysiert…" ohne Fortschritt. | Alle Tools |
| B3 | Zwei Eingabemasken hintereinander (Kontext-Check, dann freie Strukturbeschreibung). | Organisation (`OrgContextForm`) |
| B4 | Lange Fragen (bis 5 Zeilen) schieben die Antworten aus dem Bild. | Fragen-Tools |
| B5 | Chat zeigt Markdown roh (`**…**`, `*`-Listen). | Resulta |
| B6 | Chat-Antwort ohne nächsten Schritt (Erstgespräch, Tool-Link). | Resulta |

Technischer Befund: Alle Aufrufe nutzen `gemini-3.1-pro-preview` (`services/geminiService.ts`, `api/chat.ts`). Das ist wahrscheinlich die Hauptursache für B2. Das Repo hat kein Lint, keinen Typecheck und keine Tests (nur `build`).

## 2. Zuordnung Tool → Dateien

| Tool auf der Startseite | Seite(n) | KI-Funktionen in `geminiService.ts` |
|---|---|---|
| Organisation | `pages/OrganizationAnalyzer.tsx`, `pages/ReorgSimulator.tsx` | `processOrgAnalysisStep`, `processReorgStep` |
| Strategie | `pages/StrategyClarifier.tsx` | `generateStrategyOptions`, `generateStrategyFinalPlan` |
| Kultur | `pages/CultureScanner.tsx` | `generateCultureHypotheses`, `generateCultureGoals`, `generateCultureAnalysisPlan` |
| Führung | `pages/LeadershipRadar.tsx` | `generateSystemicQuestions`, `analyzeLeadershipTeam`, `generateEmployeeCoaching`, `getLeadershipAuditQuestions` |
| Veränderung | `pages/ChangeManager.tsx` | `getAssessmentQuestions`, `generateChangeAnalysis` |
| Digitale Transformation | `pages/VentureForge.tsx` | `generateVentureConcepts`, `generateVentureDeepDive` |
| Chat Resulta | Chat-Teil in `App.tsx`, `api/chat.ts` | `startResultaChat` |

## 3. Geteilte Dateien (Sperrzone)

Diese Dateien betreffen alle Tools. Sie werden nur in der Phase 0 und nur von einem Agenten geändert. Danach gilt: Wer hier etwas braucht, trägt es in Abschnitt 6 ein und wartet auf den Merge des anderen.

- `services/geminiService.ts` (gemeinsame Hilfsfunktionen, Modellwahl)
- `api/chat.ts`, `api/gemini/generate.ts`, `server.ts`
- `App.tsx`
- `contexts/LanguageContext.tsx` (Übersetzungen: neue Schlüssel nur am Ende des eigenen Tool-Blocks ergänzen)
- `components/Auth.tsx`, `components/OrgContextForm.tsx`, `components/Navigation.tsx`
- `package.json`, `package-lock.json`

## 4. Phasen

### Phase 0: gemeinsame Basis (Claude, ein PR nach dem anderen)

Reihenfolge, jeweils eigener kleiner PR:

1. **Chat Resulta** (B5, B6): Markdown rendern, Button "Erstgespräch vereinbaren", Tool-Links als klickbare Karten.
2. **Modell und Latenz** (B2): Messen, ob ein schnelleres Modell für Fragenschritte reicht. Ergebnis als Zahlenvergleich dokumentieren, bevor etwas umgestellt wird.
3. **Gemeinsamer Wartezustand** (B2): Komponente mit Fortschrittstext statt "KI analysiert…". Danach können alle Tools sie einbinden.
4. **Prüfskripte** (`typecheck`, später Lint): Damit "grün vor Push" überhaupt etwas bedeutet.

Codex arbeitet in dieser Zeit an **Tool-Prüfung ohne Codeänderung** (siehe Phase 1, Vorbereitung) und an keiner geteilten Datei.

### Phase 1: ein Tool pro Agent

Vorschlag:

| Agent | Tool 1 | Tool 2 |
|---|---|---|
| Claude | Organisation (inkl. B3, B4) | Strategie |
| Codex | Kultur | Führung (`LeadershipRadar.tsx` ist mit 1300 Zeilen die größte Seite, bewusst eigenes Tool) |
| danach | Veränderung | Digitale Transformation |

Pro Tool derselbe Ablauf:

1. Tool einmal komplett als Nutzer durchspielen und Befunde in `docs/tool-reviews/<tool>.md` festhalten.
2. Antworten und Fragen nach `docs/question-experience-system.md` der Factory prüfen, falls vorhanden (sonst die Kurzregel: Frage erzeugt beim Beantworten Erkenntnis; kurz; Antworten sofort sichtbar).
3. Kleine PRs, nur in den eigenen Dateien aus Abschnitt 2.
4. Nach Merge: Eintrag in Abschnitt 6 aktualisieren.

### Phase 2: Querschnitt

B1 (Vorschau vor Login-Wall) braucht eine Produktentscheidung von Olaf und berührt `Auth.tsx` und jedes Tool. Sie wird erst nach Phase 1 als einheitlicher Umbau angegangen, nicht tool-weise.

## 5. Spielregeln

- `main` ist immer lauffähig. Nur ein offener PR pro Agent.
- Vor jedem Push: `npm run build`. Sobald Phase 0, Punkt 4 steht: zusätzlich `typecheck`.
- Nicht ohne ausdrückliches "go" von Olaf nach `main` mergen.
- Prompts und Bewertungslogik eines Tools nur ändern, wenn der Auftrag es ausdrücklich verlangt. Reine UX-Änderungen und Prompt-Änderungen getrennt in eigenen PRs.
- Branch-Namen: `claude/<tool>-<thema>` bzw. `codex/<tool>-<thema>`.
- Übergaben zwischen den Agenten als Datei in `docs/` (z. B. `handoff-<datum>-<thema>.md`), nicht nur im privaten Gedächtnis.
- Keine Secrets, keine Kundendaten in Repo oder Docs. Das Repo ist öffentlich.

## 6. Live-Status (von beiden Agenten gepflegt)

| Tool | Agent | Branch/PR | Status | Geteilte Datei gebraucht? |
|---|---|---|---|---|
| Chat Resulta | Claude | – | wartet auf "go" | `App.tsx`, `api/chat.ts` |
| Organisation | Claude | – | Phase 1 | – |
| Strategie | Claude | – | Phase 1 | – |
| Kultur | Codex | – | Vorbereitung/Prüfung, noch nicht startbereit | – |
| Führung | Codex | – | Vorbereitung/Prüfung, noch nicht startbereit | – |
| Veränderung | offen | – | – | – |
| Digitale Transformation | offen | – | – | – |

Hinweis: „Phase 0 gemergt“ bestätigt verbindlich Claude in dieser Tabelle; erst dann startet Codex mit Codeänderungen.

Reviews unter `docs/tool-reviews/` enthalten keine Kundendaten und keine Secrets.

## 7. Entscheidungen von Olaf (2026-10-09) und offene Fragen

Entschieden: Zuordnung wie in Abschnitt 4 (Kultur und Führung an Codex). Reviews nur im Repo, nicht in Obsidian. Geprüft wird die Live-Version von hs-results.com, bis eine Vorschau-URL existiert.

Offen: Läuft Vercel mit diesem Repo verbunden (Vorschau pro PR)? Die Seite wird von Vercel ausgeliefert, die Domain liegt bei IONOS.

Ursprüngliche Fragen:

1. Ist die Zuordnung in Abschnitt 4 so gewünscht, oder soll Codex andere Tools bekommen?
2. Darf ein schnelleres Modell für Fragenschritte getestet werden (Kosten und Antwortqualität gegeneinander)?
3. Login-Wall (B1): Soll es eine kostenlose Kurzvorschau geben? Entscheidung wird in Phase 2 gebraucht.
4. Sollen die Absprachen zusätzlich in Obsidian gespiegelt werden, oder reicht das Repo?
