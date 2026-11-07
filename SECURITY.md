# Sicherheit & Datenschutz

Jeder Auftrag und Pull Request beginnt mit **„Sicherheit & Datenschutz“**. Vor der Umsetzung sind festzuhalten: welche personenbezogenen Daten betroffen sind, wohin sie fließen (Dienstleister, Drittland), Speicherdauer und Löschung, wer zugreifen darf (Anmeldung/Eigentum), Mengenbremse und Größenlimit jedes neuen Endpunkts sowie die Trennung von Nutzer- und Webtexten in KI-Prompts als **Daten, nicht Anweisungen**. Personenbezogene Daten gehören nicht in Logs. Sicherheits-Header bleiben erhalten. Für jeden neuen externen Dienst sind kommerzielle Nutzungsrechte zu prüfen sowie Nutzungsbedingungen und Datenschutzerklärung zu ergänzen.

| Datenart | Speicherort | Frist / Löschung |
| --- | --- | --- |
| Firebase-Authentifizierung (UID, E-Mail, Login-Metadaten) | Firebase Authentication | Konto und zugehörige Daten nach 12 Monaten ohne Nutzung löschen. Der täglich geplante, durch `CRON_SECRET` geschützte Vercel-Job löscht mit `FIREBASE_SERVICE_ACCOUNT_JSON`; er startet standardmäßig als Dry-Run und protokolliert nur Zählwerte. `lastSeenAt` wird bei Anmeldung und App-Nutzung aktualisiert. Provider-/Backup-Logs sind davon nicht erfasst. |
| Profil, Projekte, Vault-Metadaten, Organisationsprofile | Firestore: `users/{uid}` einschließlich aller Unterkollektionen (z. B. `files`, `projects`, `orgContexts`) | Mit Kontolöschung sofort; bei Inaktivität nach 12 Monaten durch den täglichen Job rekursiv. Bei einem Teilfehler meldet der Job keinen Erfolg und wiederholt die idempotente Bereinigung im nächsten Lauf. |
| Persönliche Dateien und Profilbild | Firebase Storage: `user_uploads/{uid}`, `user_profiles/{uid}` | Mit Kontolöschung sofort; bei Inaktivität nach 12 Monaten durch den täglichen Job. Der Export enthält keine Binärdateien, aber für eigene Objekte zeitlich begrenzte Download-Links (15 Minuten). |
| Öffentliche Beraterprofile und CVs | Firestore: `consultants`; Firebase Storage: `consultants/{name}` | Bis zur Entfernung durch die Administration bzw. bis zum Wegfall des Veröffentlichungszwecks; keine automatische Frist im Code. |
| Webseiten-Kontext einer Analyse | Nur im Request der Vercel-Funktion und bei Google Gemini | Keine Speicherung durch die Anwendung; nach Ende der Anfrage nicht vorgehalten. |
| Login-/Mail-Protokolle und verbrauchte Tokens | Keine anwendungseigene persistente Speicherung im Repository | Falls eingeführt: höchstens 30 Tage, danach löschen. |
| Rate-Limit-/IP-Einträge | Nur flüchtiger Speicher der Vercel-Funktion | Höchstens 7 Tage bei persistenter Einführung; aktuell mit Prozessende gelöscht. |
| Anonyme Entwürfe/Analysen | Keine anwendungseigene persistente Speicherung | Falls eingeführt: höchstens 90 Tage, danach löschen. |
| KI-Anfragen und Antworten | Verarbeitung bei Google Gemini; keine Speicherung durch die Anwendung | Nicht in App-Logs speichern; Anbieter- und Auftragsverarbeitungsbedingungen vor Produktivbetrieb prüfen. |
| Zahlungs-/Freischaltvermerke | Im aktuellen Code nicht vorhanden | Bei Einführung nur soweit gesetzlich nötig; Stripe-Belege verbleiben bei Stripe. |

Die bestehende Kontolöschung entfernt alle im Code verwendeten Firestore- und Storage-Pfade der Person. Sicherheitsprobleme bitte direkt an **Olaf Heger** melden.
