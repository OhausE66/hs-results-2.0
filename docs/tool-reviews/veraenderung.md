# Tool-Review: Veränderung (`pages/ChangeManager.tsx`)

Stand 2026-10-10 · Prüfung durch Claude: Code gelesen und Berichtsqualität gegen die Live-API getestet (Methode `plan_kotter`, erfundenes ERP-Szenario, keine Kundendaten).

## 1. Ablauf
Landing → Kontext (`OrgContextForm`) → Setup (Szenario, Methode, optional Kultur-Fragen per `generateSystemicQuestions`) → Assessment (statische Fragen aus `getAssessmentQuestions`) → **KI:** `generateChangeAnalysis` → Ergebnis (speichern/herunterladen).

## 2. Befunde

| # | Befund | Wirkung | Vorschlag | Aufwand | Geteilte Datei? |
|---|---|---|---|---|---|
| C1 | **Fehler beim Bericht werden still verschluckt** (`catch → console.error`). Danach ist `result` leer und die Seite rendert `null`. | Nach einem KI-Ausfall sieht der Nutzer eine leere Seite ohne Erklärung oder Wiederholen. | Fehleranzeige mit Wiederholen-Button. | klein | nein |
| C2 | Gleiches bei `generateSystemicQuestions`: Fehler nur im Log, Nutzer merkt nichts. | Optionale Kultur-Fragen erscheinen nicht, ohne Rückmeldung. | Hinweis mit Wiederholen. | klein | nein |
| C3 | Bericht braucht ca. 40 s auf dem Pro-Modell. Wartetext "Bericht wird geschmiedet…" ohne Fortschritt. | Gefühlter Hänger. | `AiWaiting` mit Phasenmeldungen und Dauerhinweis. | klein | nein |
| C4 | **Organisationsprofil geht nicht in die Analyse ein:** `companySize` und `companyUrl` werden fest als "N/A" übergeben, `orgInfo` fließt nur über den Szenario-Text in die Kultur-Fragen. | Bericht ignoriert Größe, Branche, Innovationskraft, Wirtschaftlichkeit. Weniger passgenau. | Profil in den Berichts-Prompt übernehmen (Prompt-Änderung, Freigabe nötig). | klein | ja (`geminiService.ts`) |
| C5 | Ergebnis nur eingeloggt speicherbar; keine Ergebnis-Vorschau-Logik, Bericht ist frei sichtbar. | – | Entscheidung, ob gewünscht. | – | – |
| C6 | Report-Aktionen: 4 Maßnahmen bei 8 Phasen, Prioritäten nur High/Medium. | Maßnahmenplan wirkt schmal gegenüber den Phasen. | Im Prompt Mindestzahl Maßnahmen pro Phase verlangen. | klein | ja |

## 3. Prioritäten
1. **C1/C2:** Fehler sichtbar machen.
2. **C3:** Wartezustand.
3. **C4:** Profil in den Bericht.

## 4. Qualität der Ergebnisse
Gut. Die systemische Diagnose benennt konkrete Dynamiken (fehlende Geschäftsführung als Machtvakuum, Silo-Verteidigung, Schuldigen-Kultur) und leitet daraus Phasen ab. Der Bericht hat das erwartete Format (`summary`, `systemic_diagnosis`, `strategic_logic`, `phases`, `risks`, `action_plan`, `cultural_levers`), keine Feldabweichungen. Schwächer ist der Maßnahmenplan (C6).
