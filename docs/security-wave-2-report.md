# Sicherheitswelle 2 – Umsetzungsbericht (2026-10-17)

## Umgesetzt

- Alle KI-Endpunkte (`/api/gemini/generate`, `/api/chat`, `/api/website-context`) verlangen einen verifizierten Firebase-ID-Token, begrenzen Bodies auf 64 KB und nutzen dieselbe In-Memory-Bremse (12 Anfragen/Minute je Konto und vertrauenswürdiger Vercel-IP).
- Das Tagesbudget `AI_CALLS_PER_DAY` ist konfigurierbar und standardmäßig 500; die Erschöpfungsmeldung ist DE/EN. IPs werden ausschließlich aus `x-vercel-forwarded-for` beziehungsweise `x-real-ip` abgeleitet, nie aus frei setzbarem `x-forwarded-for`.
- Öffentliche Webtexte und Chatverlauf sind in den KI-Prompts explizit als unzuverlässige Daten abgegrenzt.
- Server- und Browser-Logs enthalten keine Fehlerobjekte, E-Mail-Adressen, Prompt-/Antworttexte oder externe Response-Bodies mehr.
- Storage-Regeln schützen `user_profiles`, beschränken persönliche Uploads auf 20 MB und erlaubte Dokument-/Bild-MIME-Typen sowie Profilbilder auf 5 MB und JPG/PNG/WebP.
- „Meine Daten exportieren“ lädt die Firestore-Daten, Auth-Profilmetadaten und Storage-Pfade der angemeldeten Person als JSON herunter. Die Kontolöschung löscht `users/{uid}`, `files`, `projects`, `orgContexts`, `user_uploads/{uid}` und `user_profiles/{uid}` idempotent in 500er-Batches, bevor Firebase Auth gelöscht wird.
- `lastSeenAt` wird bei Anmeldung und App-Nutzung aktualisiert. CSP bleibt Report-Only und ergänzt `form-action`, `worker-src` und `media-src`.

## Bewusst nicht umgesetzt / Betriebsaufgabe

- Es gibt keine Cloudflare-Worker-, `wrangler`-, KV- oder D1-Konfiguration im Repository. Deshalb wurde weder ein Workers-Rate-Limiting-Binding noch ein D1-Tageszähler oder Cron-Handler hinzugefügt. Auf Vercel ist die vorhandene Bremse bewusst nur pro warmer Funktionsinstanz wirksam; eine lösungsweite verteilte Bremse erfordert einen ausdrücklich freigegebenen persistenten Dienst.
- Firestore ist vorhanden, aber es gibt keine serverseitige Firebase-Admin-Ausführungsumgebung oder Scheduler-Konfiguration und neue Abhängigkeiten sind untersagt. Die automatisierte tägliche Löschung (30/7/90 Tage sowie 12 Monate Inaktivität) kann daher nicht sicher im Repository ausgeführt werden. Vor dem Go-live muss sie über eine freigegebene, serverseitige Firebase-/Cloud-Scheduler-Lösung oder konfigurierte Firestore-TTL-Policies eingerichtet und getestet werden. Es wurde keine Migration angewendet.
- Der JSON-Export enthält aus Sicherheits- und Größen-Gründen keine Binärdateien selbst, sondern deren Metadaten/Pfade. Die Dateien können im Vault einzeln abgerufen werden. Ein serverseitiges, signiertes Komplettarchiv benötigt Admin-SDK bzw. einen freigegebenen Backend-Dienst.
- CSP kann erst durchgesetzt werden, wenn Inline-Tailwind-Konfiguration, Inline-Styles und die externen CDN-Skripte/-Module (`unsafe-inline`, Tailwind CDN, AI Studio CDN, esm.sh, SheetJS) selbst gehostet oder mit Nonces/Hashes ersetzt sind. Die beobachteten Quellen sind bereits vollständig in der Report-Only-Policy enthalten.
