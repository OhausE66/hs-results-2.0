# Tool-Review: VentureForge (`pages/VentureForge.tsx`)

Stand 2026-10-10 · Prüfung durch Claude: Code gelesen und Qualität mit echten Prompts gegen die Live-API getestet (je 2 Läufe, keine Kundendaten).

## 1. Ablauf
Landing → Kontext (`OrgContextForm`) → Corporate-Scan (Bedarfe) → Gründer-DNA → **KI 1:** `generateVentureConcepts` (3 Konzepte) → Auswahl → **KI 2:** `generateVentureDeepDive`.

## 2. Befunde

| # | Befund | Wirkung | Vorschlag | Aufwand | Geteilte Datei? |
|---|---|---|---|---|---|
| V1 | **Die Prompts geben kein Feldschema vor** ("Antworte STRENG im JSON-Format"). Test: Lauf 1 lieferte nur das Feld `name`, alle anderen erwarteten Felder (`tagline`, `problem_solved`, `monetization_strategy`, `roadmap_6_months`, …) fehlten. Lauf 2 lieferte Felder mit anderen Namen, `name` war leer. | Konzeptkarten sind leer oder halb leer. Kernfunktion des Tools unzuverlässig. | Schema in den Prompt aufnehmen und per `responseSchema` erzwingen (wie bei den anderen Tools beschrieben). Das ist eine Prompt-Änderung und braucht Olafs Freigabe. | mittel | ja (`geminiService.ts`) |
| V2 | **Deep-Dive liefert andere Feldnamen als die Seite erwartet** (`executive_summary`, `strategic_fit`, `business_model`, … statt `market_potential`, `usp_details`, `extended_roadmap`). Die Seite ruft `deepDive.extended_roadmap.map(...)` direkt auf. | **Abstürzende Seite (weißer Bildschirm)**, sobald das Feld fehlt. Sehr wahrscheinlich im Normalfall. | Wie V1; zusätzlich defensiv rendern (`(deepDive.extended_roadmap ?? []).map`). | klein bis mittel | ja / `VentureForge.tsx` |
| V3 | Fehler werden nur per `console.error` behandelt; Nutzer sieht Spinner, dann leere Seite. | Kein Wiederholen möglich. | Fehleranzeige mit Wiederholen-Button wie bei Kultur. | klein | nein |
| V4 | Wartezeit 22–25 s (Konzepte), 34 s (Deep-Dive) auf `gemini-3.1-pro-preview`; Wartetext rein deutsch ("KI schmiedet Konzepte…"). | Gefühlter Hänger, bei EN-Oberfläche Sprachbruch. | `AiWaiting` mit DE/EN-Meldungen. Schnelles Modell für Konzepte prüfen (nur nach Schema-Fix). | klein | nein |
| V5 | Konzeptfeld heißt `reddit_trend_connection` und `exit_scenario_300k`: Produkt-Framing ist für Konzern-Ausgründungen ungewöhnlich. | Wirkt unseriös für Konzernkunden. | Produktentscheidung (Olaf). | klein | nein |
| V6 | Keine Ergebnis-Vorschau, kein sichtbarer Anmeldeschritt im Code gefunden. | Ergebnis ist frei zugänglich; Speichern ist nur eingeloggt möglich. | Entscheidung, ob hier eine Vorschau-Logik gewünscht ist. | – | – |

## 3. Prioritäten
1. **V1+V2:** Ausgabeformat verbindlich machen und Absturz verhindern. Das ist ein Fehler, kein Schönheitsproblem.
2. **V3+V4:** Fehler sichtbar machen, Wartezustand mit `AiWaiting`.
3. **V5:** Produktfrage klären.

## 4. Qualität der Ergebnisse
Inhaltlich sind die Konzepte brauchbar (z. B. "EcoPredict Retrofit Services", "CircuPlant EaaS" für Maschinenbau/Predictive Maintenance), die Deep-Dive-Texte sind umfangreich. Das Problem ist nicht die Idee, sondern dass sie nicht zuverlässig in die Felder der Seite passt.
