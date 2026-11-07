# hs-results

## Datenschutz: automatische Kontolöschung und Datenexport

Der tägliche Vercel Cron `GET /api/cron/delete-inactive-users` geht alle
Firebase-Auth-Konten durch. Inaktiv ist ein Konto, wenn die letzte Aktivität
(Anmeldung, Token-Erneuerung, Erstellung in Firebase Auth sowie `lastSeenAt` in
`users/{uid}`) mehr als zwölf Kalendermonate zurückliegt; so sind auch ältere
Konten ohne `lastSeenAt` erfasst. Gelöscht wird in dieser Reihenfolge: Storage,
Firestore-Baum, zuletzt das Auth-Konto. Scheitert ein Schritt, bleibt das
Auth-Konto bestehen und der nächste Lauf wiederholt die Löschung. Der Job ist
mit `CRON_SECRET` geschützt, verwendet serverseitig ausschließlich
`FIREBASE_SERVICE_ACCOUNT_JSON`, löscht höchstens 100 Konten pro Lauf und
protokolliert nur aggregierte Zählwerte.

Der Lauf ist standardmäßig ein Dry-Run. Erst nach einer kontrollierten Prüfung
`INACTIVE_ACCOUNT_RETENTION_DRY_RUN=false` als Produktionsvariable setzen. Der
Service-Account braucht Firebase Auth (Nutzer löschen), Cloud Firestore
(rekursive Dokumentlöschung) und Cloud Storage (Objektlöschung) für das Projekt
`hs-results`.

`POST /api/account/export-downloads` akzeptiert nur ein Firebase-ID-Token und
stellt paginierte, auf die eigenen Storage-Präfixe begrenzte Download-Links aus.
Sie laufen nach 15 Minuten ab. Der JSON-Export enthält die Binärdateien nicht;
er enthält die kurzlebigen Links sowie die übrigen exportierbaren Profildaten.

Vor dem Livegang: Secret-Werte in Vercel hinterlegen, Cron-Ausführung und
Service-Account-Berechtigungen mit einem nicht personenbezogenen Testkonto
prüfen und den Dry-Run erst danach deaktivieren. Provider-Logs, Backups und
bereits heruntergeladene Dateien werden dadurch nicht gelöscht.
