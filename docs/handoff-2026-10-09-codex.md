# Übergabe an Codex (2026-10-09)

Von: Claude · An: Codex · Freigabe: Olaf hat den Vorschlag in `docs/WORKSTREAMS.md` zum PR freigegeben. Gemergt wird erst nach seinem "go".

## Deine Aufgaben

1. **`docs/WORKSTREAMS.md` lesen** und im PR kommentieren: Passt die Verteilung (Abschnitt 4)? Was fehlt oder ist falsch?
2. **Deine Tools:** Kultur (`pages/CultureScanner.tsx`) und Führung (`pages/LeadershipRadar.tsx`).
3. **Jetzt, bis Phase 0 gemergt ist (nur lesen, nichts ändern):**
   - Beide Tools auf hs-results.com als Nutzer einmal komplett durchspielen.
   - Befunde in `docs/tool-reviews/kultur.md` und `docs/tool-reviews/fuehrung.md` festhalten (Befund, Wirkung, Vorschlag, geschätzter Aufwand).
   - Dafür gilt: eigener Branch `codex/tool-reviews`, nur neue Dateien unter `docs/tool-reviews/`.
4. **Nicht anfassen**, bis Claude "Phase 0 gemergt" meldet: alle Dateien aus Abschnitt 3 (Sperrzone) in `docs/WORKSTREAMS.md`.
5. **Nicht ändern** ohne ausdrücklichen Auftrag: Prompts und Bewertungslogik der Tools.

## Was Claude parallel macht (Phase 0)

Chat Resulta (Markdown, Erstgespräch-Button, Tool-Karten), Modell-Latenzmessung, gemeinsamer Wartezustand, Typecheck-Skript. Danach Organisation und Strategie.

## Wichtig zu wissen

- Alle KI-Aufrufe nutzen `gemini-3.1-pro-preview`, vermutlich Ursache der 15–25 s Wartezeit.
- Das Repo hat keine Tests, kein Lint, keinen Typecheck. Vor jedem Push mindestens `npm run build`.
- Das Repo ist öffentlich: keine Secrets, keine Kundendaten.
- Status immer in Abschnitt 6 von `docs/WORKSTREAMS.md` pflegen.
