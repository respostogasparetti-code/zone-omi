# Zone OMI

Perimetri delle zone OMI e quotazioni immobiliari, un file per comune (codice catastale), usati dalla mappa catastale di [www.espostogasparetti.it](https://www.espostogasparetti.it/mappa.html).

**Fonte dei dati: Agenzia delle Entrate – Osservatorio del Mercato Immobiliare (OMI)**, forniture "Quotazioni immobiliari e perimetri di zona", semestre 2026/1. I contorni sono semplificati (circa 5 m) per la visualizzazione sul web: per i valori ufficiali fa fede la banca dati dell'Agenzia delle Entrate.

Formato di `2026-1/<codice>.json`:
- `c` codice catastale, `n` nome del comune, `s` semestre
- `z` zone: `z` codice zona, `f` fascia, `d` descrizione, `p` poligoni (anelli con coordinate intere in 1e-5 gradi, codificate a differenze: x=lon, y=lat), `q` quotazioni `[tipologia, stato (O/N/S), compr. min, compr. max €/m², loc. min, loc. max €/m² mese]`

Elaborazione: Geom. Roberto Esposto Gasparetti, Sassoferrato (AN).
