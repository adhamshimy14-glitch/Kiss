# KISS – Keep It Super Simple

Softwareconcept voor de controlepraktijk van accountantskantoren: uit een paar klantkenmerken een onderbouwde controlebegroting, kostprijs, adviesprijs en minimaal gewenste verkoopprijs.

## Inhoud

| Map | Wat |
|---|---|
| `app/` | Werkende demo (statische webapp, geen build nodig). Wordt via Vercel gepubliceerd. |
| `docs/KISS-ontwerp.md` | Ontwerpdocument uit de office-hours-sessie (probleem, premissen, aanpak, opdracht). |
| `excel/` | Margescan: invulsjabloon voor kantoren, rekenmodel en het script dat beide genereert. |

## Demo

- Live: https://kiss-demo-groenhartautomotive.vercel.app
- Lokaal: open `app/index.html` in een browser, of draai `python3 -m http.server` in `app/`.

Wat de demo doet:

- **Opdrachten**: klantkenmerken invullen (omzet, entiteiten, omzetstromen, processen, bankrekeningen, eerstejaarscontrole, voorraden), risico en complexiteit per post, begroting per werkzaamheid en functieniveau, kostprijs, adviesprijs, minimumprijs en een signaal (onder minimum / onder advies / op advies).
- **Afronden**: offerteprijs vaststellen; afwijking van het advies vraagt om een reden.
- **Exporteren**: Excel (.xlsx met samenvatting, begroting, kostprijs en nacalculatie), PDF via afdrukken, en een KISS-bestand (.kiss.json) dat je later via *Bestand openen* weer opent.
- **Portefeuille**: alle opdrachten op volgorde van marge, met export naar Excel.
- **Instellingen** en **Bibliotheek**: tarieven, toeslagen, margedoelen, factoren en normtijden per werkzaamheid.

De indeling past zich aan het scherm aan: op brede schermen lijst, opdracht en samenvatting naast elkaar; op laptop en tablet de samenvatting boven de opdracht; op telefoon alles onder elkaar met navigatie onderin.

Gegevens blijven in de browser van de gebruiker (localStorage). Er is geen server of database. Alle normtijden, tarieven en factoren zijn voorbeeldwaarden, geen normen. Gebruik geen echte klantgegevens in de openbare demo.

## Rekenregels

- Begrote uren per werkzaamheid = normuren × driver × risicofactor × complexiteitsfactor van de post × (1 + toeslag eerste jaar, alleen bij een eerstejaarscontrole).
- Kostprijs = Σ(uren × direct tarief per niveau) × (1 + toeslag indirecte kosten) + opdrachtgebonden kosten.
- Adviesprijs: margemethode = kostprijs ÷ (1 − marge); opslagmethode = kostprijs × (1 + winstopslag).
- Minimumprijs = kostprijs ÷ (1 − minimale marge op omzet). Het advies is nooit lager dan het minimum.

## Excel opnieuw genereren

```bash
cd excel && python3 build_excel.py
```

Vereist `openpyxl`. Het rekenmodel bevat nog niet de indicatoren omzetstromen, processen, bankrekeningen, eerstejaarscontrole en risico/complexiteit per post; die zitten wel in de demo.
