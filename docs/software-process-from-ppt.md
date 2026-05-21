# Prozess-Erweiterungen aus `Anmerkungen_Software_prozess.pptx`

Die zweite PowerPoint ergänzt den bisherigen Strukturentwurf um Prozesshinweise.

## Ausgelesene Prozesspunkte

- Sprengnetter als Bewertungsbezug.
- Erinnerung an Benutzer, dass beim Kunden nachgefragt werden muss.
- Wenn Rückmeldung vom Kunden kommt, muss keine weitere Rückmeldung gegeben werden.
- Angebotskalkulation erfolgt über die Applikation.

## MVP-Abbildung

- Neue Properties-Felder: `preferredValuationProvider`, `followUpRequired`, `followUpReason`, `followUpDueAt`, `customerFeedbackReceivedAt`, `offerCalculationSource`.
- Bewertung startet standardmäßig als `sprengnetter`-Stub. Der externe API-Anschluss bleibt austauschbar.
- Admin kann eine Rückfrage anfordern. Der Fall geht auf `DATA_INCOMPLETE`, es entsteht ein Aktivitätseintrag und eine Wiedervorlage.
- Partner oder Admin können Kundenrückmeldung als eingegangen markieren. Die offene Erinnerung wird geschlossen.
- Angebotsberechnung schreibt `offerCalculationSource = application` und dokumentiert im Activity-Log, dass die Kalkulation in der Applikation erfolgte.
