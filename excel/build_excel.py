from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.formatting.rule import CellIsRule, FormulaRule
from openpyxl.comments import Comment
from openpyxl.utils import get_column_letter as L

F = "Arial"
BLUE = Font(name=F, color="0000FF")
BLACK = Font(name=F)
GREEN = Font(name=F, color="008000")
BOLD = Font(name=F, bold=True)
TITLE = Font(name=F, bold=True, size=14)
HDR = Font(name=F, bold=True, color="FFFFFF")
HDRFILL = PatternFill("solid", fgColor="1F4E78")
YELLOW = PatternFill("solid", fgColor="FFFF00")
GREY = PatternFill("solid", fgColor="EDEDED")
WRAP = Alignment(wrap_text=True, vertical="top")
thin = Side(style="thin", color="BFBFBF")
BOX = Border(left=thin, right=thin, top=thin, bottom=thin)

EUR = '€ #,##0;(€ #,##0);-'
PCT = '0.0%;(0.0%);-'
NUM = '#,##0;(#,##0);-'
DEC = '0.00'
EUR2 = '€ #,##0.00'

LEVELS = ["Junior", "Assistent", "Senior", "Manager", "Partner"]
N = 10  # opdrachten

# ---------- shared opdracht columns ----------
OPD_COLS = [
    ("Opdrachtcode", 14, None, "Code i.p.v. klantnaam, bijv. K-01"),
    ("Omzet (€)", 14, EUR, "Netto-omzet laatste boekjaar"),
    ("Balanstotaal (€)", 15, EUR, "Info; nog niet gebruikt in berekening"),
    ("Aantal entiteiten", 11, NUM, "Incl. moedermaatschappij"),
    ("Aantal medewerkers", 12, NUM, "Info; nog niet gebruikt in berekening"),
    ("Voorraden (Ja/Nee)", 11, None, "Materiële voorraden aanwezig?"),
    ("Complexiteit (1-3)", 11, NUM, "1 = eenvoudig, 2 = gemiddeld, 3 = complex"),
    ("Risicoprofiel (1-3)", 11, NUM, "1 = laag, 2 = gemiddeld, 3 = hoog"),
    ("Huidig honorarium (€)", 15, EUR, "Gefactureerd honorarium laatste controle, excl. btw"),
    ("Opdrachtgebonden kosten (€)", 15, EUR, "Externe kosten: specialist, reis, bevestigingen"),
] + [(f"Werkelijke uren {lv}", 11, NUM, f"Geschreven uren {lv.lower()} laatste controle") for lv in LEVELS] + [
    ("Opmerking", 30, None, "Bijzonderheden"),
]
EXAMPLE = ["VB-01", 12000000, 6500000, 2, 45, "Ja", 2, 2, 16500, 500, 40, 60, 70, 35, 15,
           "VOORBEELD - overschrijven met eigen opdracht"]


def style_header(ws, row, ncols):
    for c in range(1, ncols + 1):
        cell = ws.cell(row=row, column=c)
        cell.font = HDR
        cell.fill = HDRFILL
        cell.alignment = Alignment(wrap_text=True, vertical="center", horizontal="center")
        cell.border = BOX
    ws.row_dimensions[row].height = 45


def write_opdrachten(ws, first_row, example_first, n_rows, example_grey):
    ws["A1"] = "Opdrachten"
    ws["A1"].font = TITLE
    ws["A2"] = "Gele cellen invullen. Eén regel per controleopdracht. Klantnamen vervangen door een code."
    ws["A2"].font = Font(name=F, italic=True)
    hr = first_row - 1
    for i, (h, w, fmt, note) in enumerate(OPD_COLS, start=1):
        c = ws.cell(row=hr, column=i, value=h)
        c.comment = Comment(note, "KISS")
        ws.column_dimensions[L(i)].width = w
    style_header(ws, hr, len(OPD_COLS))
    rows = range(first_row, first_row + n_rows)
    for r in rows:
        for i, (h, w, fmt, note) in enumerate(OPD_COLS, start=1):
            c = ws.cell(row=r, column=i)
            c.font = BLUE
            c.fill = YELLOW
            c.border = BOX
            if fmt:
                c.number_format = fmt
    if example_first:
        r = first_row
        for i, v in enumerate(EXAMPLE, start=1):
            c = ws.cell(row=r, column=i, value=v)
            if example_grey:
                c.fill = GREY
                c.font = Font(name=F, color="0000FF", italic=True)
    last = first_row + n_rows - 1
    dv_jn = DataValidation(type="list", formula1='"Ja,Nee"', allow_blank=True)
    dv_13 = DataValidation(type="whole", operator="between", formula1="1", formula2="3", allow_blank=True)
    ws.add_data_validation(dv_jn)
    ws.add_data_validation(dv_13)
    dv_jn.add(f"F{first_row}:F{last}")
    dv_13.add(f"G{first_row}:H{last}")
    ws.freeze_panes = ws.cell(row=first_row, column=2)


def font_all(ws):
    for row in ws.iter_rows():
        for c in row:
            if c.font is None or c.font.name != F:
                f = c.font
                c.font = Font(name=F, bold=f.bold, italic=f.italic, color=f.color, size=f.size)


# =====================================================================
# 1) INVULSJABLOON voor het kantoor
# =====================================================================
wb = Workbook()
ws = wb.active
ws.title = "Instructies"
lines = [
    ("KISS Margescan - invulsjabloon", TITLE),
    ("", None),
    ("Wat vragen we?", BOLD),
    ("1. Tabblad 'Kantoorparameters': vul uw directe kostentarieven, toeslag indirecte kosten en margedoelen in.", None),
    ("2. Tabblad 'Opdrachten': vul 10 wettelijke controleopdrachten in, één regel per opdracht.", None),
    ("3. Vervang klantnamen door een code (bijv. K-01). Vermeld geen namen van medewerkers.", None),
    ("4. Werkelijke uren: per functieniveau, uit uw urenregistratie (laatste afgeronde controle).", None),
    ("", None),
    ("Legenda", BOLD),
    ("Gele cel met blauwe tekst = invullen.", None),
    ("Grijze regel = voorbeeld van het verwachte formaat (mag u overschrijven of laten staan).", None),
    ("Bedragen in euro, excl. btw. Percentages als percentage (bijv. 30%).", None),
    ("", None),
    ("Vertrouwelijkheid", BOLD),
    ("De gegevens worden uitsluitend gebruikt voor de margescan, conform de getekende geheimhoudingsovereenkomst.", None),
]
for i, (t, f) in enumerate(lines, start=1):
    c = ws.cell(row=i, column=1, value=t)
    c.font = f or BLACK
ws.column_dimensions["A"].width = 110

wp = wb.create_sheet("Kantoorparameters")
wp["A1"] = "Kantoorparameters"
wp["A1"].font = TITLE
wp["A3"] = "Direct kostentarief per uur (salaris + werkgeverslasten, zonder overhead)"
wp["A3"].font = BOLD
for i, lv in enumerate(LEVELS):
    wp.cell(row=4 + i, column=1, value=lv).font = BLACK
    c = wp.cell(row=4 + i, column=2)
    c.fill, c.font, c.number_format, c.border = YELLOW, BLUE, EUR2, BOX
rows = [
    (10, "Toeslag indirecte kosten (% over personeelskosten; 0% als tarieven al integraal zijn)", PCT),
    (12, "Gewenste prijsmethode (Marge of Opslag)", None),
    (13, "Gewenste marge op omzet (bij methode Marge)", PCT),
    (14, "Gewenste winstopslag op kostprijs (bij methode Opslag)", PCT),
    (15, "Minimale marge op omzet (ondergrens)", PCT),
]
for r, label, fmt in rows:
    wp.cell(row=r, column=1, value=label).font = BLACK
    c = wp.cell(row=r, column=2)
    c.fill, c.font, c.border = YELLOW, BLUE, BOX
    if fmt:
        c.number_format = fmt
dv = DataValidation(type="list", formula1='"Marge,Opslag"', allow_blank=True)
wp.add_data_validation(dv)
dv.add("B12")
wp.column_dimensions["A"].width = 85
wp.column_dimensions["B"].width = 16

wo = wb.create_sheet("Opdrachten")
write_opdrachten(wo, first_row=4, example_first=True, n_rows=N + 1, example_grey=True)
wb.save("KISS-margescan-invulsjabloon.xlsx")

# =====================================================================
# 2) REKENMODEL
# =====================================================================
wb = Workbook()
ws = wb.active
ws.title = "Instructies"
lines = [
    ("KISS Margescan - rekenmodel", TITLE),
    ("", None),
    ("Werkwijze", BOLD),
    ("1. Parameters: neem de kantoorparameters over uit het ingevulde invulsjabloon.", None),
    ("2. Bibliotheek: vervang de VOORBEELD-normtijden door uw eigen werkzaamheden en normtijden. Leg dit vast VÓÓR de data binnenkomt.", None),
    ("3. Opdrachten: plak de 10 opdrachten uit het invulsjabloon (zelfde kolommen).", None),
    ("4. Berekening en Portefeuille rekenen automatisch: begrote uren, kostprijs, adviesprijs, minimumprijs, signaal, nacalculatie.", None),
    ("5. Rapport aan de partner = tabblad Portefeuille (ongekalibreerd basismodel). Pas daarna kalibreren op 7 opdrachten, testen op 3.", None),
    ("", None),
    ("Legenda", BOLD),
    ("Blauwe tekst = invoer. Gele achtergrond = aanname of invulveld. Zwarte tekst = formule. Groene tekst = verwijzing naar ander tabblad.", None),
    ("", None),
    ("Rekenregels", BOLD),
    ("Begrote uren per niveau = (Vast + Omvang × omvangfactor + Voorraad × omvangfactor × [voorraden Ja] + Per extra entiteit × extra entiteiten) × complexiteitsfactor × risicofactor", None),
    ("Kostprijs = personeelskosten (uren × direct tarief) × (1 + toeslag indirecte kosten) + opdrachtgebonden kosten", None),
    ("Adviesprijs: methode Marge = kostprijs / (1 − marge); methode Opslag = kostprijs × (1 + winstopslag)", None),
    ("Minimumprijs = kostprijs / (1 − minimale marge op omzet). Minimale marge is altijd een marge op omzet.", None),
    ("Validatie: adviesprijs ≥ minimumprijs. Is de berekende adviesprijs lager, dan wordt de minimumprijs gebruikt en verschijnt een waarschuwing.", None),
    ("Signaal: huidig honorarium < minimumprijs = ROOD; < adviesprijs = ORANJE; anders GROEN.", None),
    ("", None),
    ("Let op", BOLD),
    ("Alle normtijden, factoren en tarieven in dit bestand zijn VOORBEELDEN, geen normen. Vervang ze door uw eigen vakinschatting.", None),
]
for i, (t, f) in enumerate(lines, start=1):
    c = ws.cell(row=i, column=1, value=t)
    c.font = f or BLACK
    c.alignment = Alignment(wrap_text=True)
ws.column_dimensions["A"].width = 140

# ---------- Parameters ----------
wp = wb.create_sheet("Parameters")
wp["A1"] = "Parameters"
wp["A1"].font = TITLE
wp["C1"] = "Alle waarden zijn VOORBEELDEN - vervangen door kantoorparameters"
wp["C1"].font = Font(name=F, italic=True, color="C00000")
wp["A3"] = "Direct kostentarief per uur"
wp["A3"].font = BOLD
rates = [35, 45, 60, 80, 120]
for i, (lv, v) in enumerate(zip(LEVELS, rates)):
    wp.cell(row=4 + i, column=1, value=lv)
    c = wp.cell(row=4 + i, column=2, value=v)
    c.font, c.fill, c.number_format, c.border = BLUE, YELLOW, EUR2, BOX
params = [
    (10, "Toeslag indirecte kosten (% over personeelskosten)", 0.60, PCT),
    (12, "Prijsmethode (Marge of Opslag)", "Marge", None),
    (13, "Gewenste marge op omzet (methode Marge)", 0.30, PCT),
    (14, "Gewenste winstopslag op kostprijs (methode Opslag)", 0.30, PCT),
    (15, "Minimale marge op omzet (ondergrens)", 0.15, PCT),
]
for r, label, v, fmt in params:
    wp.cell(row=r, column=1, value=label)
    c = wp.cell(row=r, column=2, value=v)
    c.font, c.fill, c.border = BLUE, YELLOW, BOX
    if fmt:
        c.number_format = fmt
dv = DataValidation(type="list", formula1='"Marge,Opslag"', allow_blank=False)
wp.add_data_validation(dv)
dv.add("B12")

wp["A18"] = "Omvangfactor naar omzet (ondergrens omzet → factor)"
wp["A18"].font = BOLD
for i, (t, f) in enumerate([(0, 0.8), (5000000, 1.0), (20000000, 1.3), (50000000, 1.7)]):
    a = wp.cell(row=19 + i, column=1, value=t)
    b = wp.cell(row=19 + i, column=2, value=f)
    a.number_format = EUR
    for c in (a, b):
        c.font, c.fill, c.border = BLUE, YELLOW, BOX
    b.number_format = DEC
wp["A24"] = "Complexiteitsfactor"
wp["A24"].font = BOLD
for i, (k, f) in enumerate([(1, 0.9), (2, 1.0), (3, 1.25)]):
    a = wp.cell(row=25 + i, column=1, value=k)
    b = wp.cell(row=25 + i, column=2, value=f)
    for c in (a, b):
        c.font, c.fill, c.border = BLUE, YELLOW, BOX
    b.number_format = DEC
wp["A29"] = "Risicofactor"
wp["A29"].font = BOLD
for i, (k, f) in enumerate([(1, 0.9), (2, 1.0), (3, 1.2)]):
    a = wp.cell(row=30 + i, column=1, value=k)
    b = wp.cell(row=30 + i, column=2, value=f)
    for c in (a, b):
        c.font, c.fill, c.border = BLUE, YELLOW, BOX
    b.number_format = DEC
wp["A34"] = "Controle"
wp["A34"].font = BOLD
wp["A35"] = "Berekende adviesprijs ≥ minimumprijs bij deze parameters?"
wp["B35"] = '=IF(IF(B12="Marge",1/(1-B13),1+B14)>=1/(1-B15),"OK","WAARSCHUWING: advies < minimum")'
wp.column_dimensions["A"].width = 62
wp.column_dimensions["B"].width = 18

# ---------- Bibliotheek ----------
wl = wb.create_sheet("Bibliotheek")
wl["A1"] = "Bibliotheek werkzaamheden en normtijden"
wl["A1"].font = TITLE
wl["A2"] = ("VOORBEELD-normtijden. Driver: Vast = vaste uren; Omvang = × omvangfactor; "
            "Voorraad = × omvangfactor, alleen bij voorraden Ja; Per extra entiteit = × (entiteiten − 1).")
wl["A2"].font = Font(name=F, italic=True, color="C00000")
heads = ["Jaarrekeningpost", "Werkzaamheid", "Driver", "Basisuren"] + [f"% {lv}" for lv in LEVELS] + \
        ["Check % = 100%"] + [f"Uren {lv}" for lv in LEVELS]
for i, h in enumerate(heads, start=1):
    wl.cell(row=3, column=i, value=h)
style_header(wl, 3, len(heads))
LIB = [
    ("Algemeen", "Planning, opdrachtacceptatie en risicoanalyse", "Vast", 20, (0, .10, .40, .30, .20)),
    ("Algemeen", "Materialiteit en controleplan", "Vast", 8, (0, 0, .40, .40, .20)),
    ("Algemeen", "Interim: interne beheersing en IT", "Omvang", 24, (.20, .30, .35, .10, .05)),
    ("Omzet", "Cijferanalyse en detailcontrole omzet", "Omvang", 28, (.30, .35, .25, .08, .02)),
    ("Omzet", "Cut-off", "Omvang", 6, (.40, .35, .20, .05, 0)),
    ("Debiteuren", "Saldobevestigingen en nacontrole", "Omvang", 10, (.40, .35, .20, .05, 0)),
    ("Voorraden", "Inventarisatie en waardering", "Voorraad", 18, (.25, .35, .30, .08, .02)),
    ("Materiële vaste activa", "Mutaties en waardering", "Omvang", 10, (.30, .40, .25, .05, 0)),
    ("Liquide middelen", "Bankbevestigingen", "Vast", 4, (.50, .30, .20, 0, 0)),
    ("Crediteuren en overlopende passiva", "Volledigheid en nacontrole", "Omvang", 12, (.40, .35, .20, .05, 0)),
    ("Personeelskosten", "Cijferanalyse en salarisadministratie", "Omvang", 10, (.35, .35, .25, .05, 0)),
    ("Overige posten / eigen vermogen", "Overige balans- en resultaatposten", "Omvang", 8, (.20, .30, .35, .10, .05)),
    ("Consolidatie / deelnemingen", "Per extra entiteit", "Per extra entiteit", 12, (0, .20, .50, .25, .05)),
    ("Jaarrekening", "Toelichting en presentatie", "Vast", 12, (0, .30, .50, .15, .05)),
    ("Algemeen", "Afronding, rapportage en dossierreview", "Vast", 20, (0, .10, .35, .35, .20)),
]
LIB_FIRST, LIB_LAST = 4, 40
dv_drv = DataValidation(type="list", formula1='"Vast,Omvang,Voorraad,Per extra entiteit"', allow_blank=True)
wl.add_data_validation(dv_drv)
dv_drv.add(f"C{LIB_FIRST}:C{LIB_LAST}")
for r in range(LIB_FIRST, LIB_LAST + 1):
    idx = r - LIB_FIRST
    vals = None
    if idx < len(LIB):
        post, wz, drv, uren, pct = LIB[idx]
        vals = [post, wz, drv, uren] + list(pct)
    for c in range(1, 10):
        cell = wl.cell(row=r, column=c, value=(vals[c - 1] if vals else None))
        cell.font, cell.fill, cell.border = BLUE, YELLOW, BOX
        if 5 <= c <= 9:
            cell.number_format = '0%'
    chk = wl.cell(row=r, column=10, value=f'=IF(D{r}="","",IF(ABS(SUM(E{r}:I{r})-1)<0.0001,"OK","FOUT"))')
    chk.border = BOX
    for j in range(5):
        col = 11 + j
        pc = L(5 + j)
        c = wl.cell(row=r, column=col, value=f'=IF(D{r}="",0,D{r}*{pc}{r})')
        c.number_format = '0.0'
        c.border = BOX
for i, w in enumerate([30, 42, 18, 10, 9, 9, 9, 9, 9, 11, 10, 10, 10, 10, 10], start=1):
    wl.column_dimensions[L(i)].width = w
# driver totals table at Q3
wl["Q2"] = "Totaal uren per driver en niveau (formules)"
wl["Q2"].font = BOLD
for i, h in enumerate(["Driver"] + LEVELS + ["Totaal"]):
    wl.cell(row=3, column=17 + i, value=h)
for c in range(17, 24):
    cell = wl.cell(row=3, column=c)
    cell.font, cell.fill, cell.border = HDR, HDRFILL, BOX
DRIVERS = ["Vast", "Omvang", "Voorraad", "Per extra entiteit"]
for i, d in enumerate(DRIVERS):
    r = 4 + i
    wl.cell(row=r, column=17, value=d).border = BOX
    for j in range(5):
        src = L(11 + j)
        c = wl.cell(row=r, column=18 + j,
                    value=f'=SUMIFS({src}${LIB_FIRST}:{src}${LIB_LAST},$C${LIB_FIRST}:$C${LIB_LAST},$Q{r})')
        c.number_format = '0.0'
        c.border = BOX
    c = wl.cell(row=r, column=23, value=f'=SUM(R{r}:V{r})')
    c.number_format, c.border = '0.0', BOX
wl.column_dimensions["Q"].width = 20
for col in "RSTUVW":
    wl.column_dimensions[col].width = 11
wl.freeze_panes = "C4"

# ---------- Opdrachten ----------
wo = wb.create_sheet("Opdrachten")
write_opdrachten(wo, first_row=4, example_first=True, n_rows=N, example_grey=False)
OF, OL = 4, 4 + N - 1

# ---------- Berekening ----------
wc = wb.create_sheet("Berekening")
wc["A1"] = "Berekening per opdracht (alleen formules)"
wc["A1"].font = TITLE
B_HEADS = ["Opdrachtcode", "Omvangfactor", "Complexiteitsfactor", "Risicofactor", "Extra entiteiten",
           "Voorraden (1/0)"] + [f"Begrote uren {lv}" for lv in LEVELS] + [
    "Begrote uren totaal", "Personeelskosten (€)", "Toeslag indirecte kosten (€)", "Opdrachtgebonden kosten (€)",
    "Kostprijs (€)", "Adviesprijs berekend (€)", "Minimumprijs (€)", "Adviesprijs na validatie (€)",
    "Waarschuwing", "Huidig honorarium (€)", "Huidig honorarium − advies (€)", "Begrote marge bij huidig honorarium",
    "Signaal", "Werkelijke uren totaal", "Werkelijke kosten (€)", "Gerealiseerde marge",
    "Afwijking uren (werkelijk vs begroot)", "Rangsleutel (hulp)", "Tekort t.o.v. minimumprijs (€)",
    "Tekort t.o.v. adviesprijs (€)"]
for i, h in enumerate(B_HEADS, start=1):
    wc.cell(row=3, column=i, value=h)
style_header(wc, 3, len(B_HEADS))
P = "Parameters!"
for k in range(N):
    r = 4 + k
    o = OF + k
    g = lambda s: f'=IF($A{r}="","",{s})'
    f = {}
    f["A"] = f'=IF(Opdrachten!A{o}="","",Opdrachten!A{o})'
    f["B"] = g(f'INDEX({P}$B$19:$B$22,MATCH(Opdrachten!B{o},{P}$A$19:$A$22,1))')
    f["C"] = g(f'INDEX({P}$B$25:$B$27,MATCH(Opdrachten!G{o},{P}$A$25:$A$27,0))')
    f["D"] = g(f'INDEX({P}$B$30:$B$32,MATCH(Opdrachten!H{o},{P}$A$30:$A$32,0))')
    f["E"] = g(f'MAX(0,Opdrachten!D{o}-1)')
    f["F"] = g(f'IF(Opdrachten!F{o}="Ja",1,0)')
    for j, colL in enumerate("GHIJK"):
        bl = L(18 + j)  # R..V in Bibliotheek
        f[colL] = g(f'(Bibliotheek!{bl}$4+Bibliotheek!{bl}$5*$B{r}+Bibliotheek!{bl}$6*$B{r}*$F{r}'
                    f'+Bibliotheek!{bl}$7*$E{r})*$C{r}*$D{r}')
    f["L"] = g(f'SUM(G{r}:K{r})')
    f["M"] = g(f'G{r}*{P}$B$4+H{r}*{P}$B$5+I{r}*{P}$B$6+J{r}*{P}$B$7+K{r}*{P}$B$8')
    f["N"] = g(f'M{r}*{P}$B$10')
    f["O"] = g(f'N(Opdrachten!J{o})')
    f["P"] = g(f'M{r}+N{r}+O{r}')
    f["Q"] = g(f'IF({P}$B$12="Marge",P{r}/(1-{P}$B$13),P{r}*(1+{P}$B$14))')
    f["R"] = g(f'P{r}/(1-{P}$B$15)')
    f["S"] = g(f'MAX(Q{r},R{r})')
    f["T"] = g(f'IF(Q{r}<R{r},"Advies < minimum: parameters controleren","")')
    f["U"] = g(f'N(Opdrachten!I{o})')
    f["V"] = g(f'U{r}-S{r}')
    f["W"] = g(f'IF(U{r}>0,(U{r}-P{r})/U{r},"")')
    f["X"] = g(f'IF(U{r}<R{r},"ROOD",IF(U{r}<S{r},"ORANJE","GROEN"))')
    f["Y"] = g(f'SUM(Opdrachten!K{o}:O{o})')
    f["Z"] = g(f'(Opdrachten!K{o}*{P}$B$4+Opdrachten!L{o}*{P}$B$5+Opdrachten!M{o}*{P}$B$6'
               f'+Opdrachten!N{o}*{P}$B$7+Opdrachten!O{o}*{P}$B$8)*(1+{P}$B$10)+O{r}')
    f["AA"] = g(f'IF(AND(U{r}>0,Y{r}>0),(U{r}-Z{r})/U{r},"")')
    f["AB"] = g(f'IF(AND(L{r}>0,Y{r}>0),(Y{r}-L{r})/L{r},"")')
    f["AC"] = f'=IF(OR($A{r}="",N(U{r})=0),"",W{r}+ROW()/1000000000)'
    f["AD"] = g(f'MAX(0,R{r}-U{r})')
    f["AE"] = g(f'MAX(0,S{r}-U{r})')
    fmts = {"B": DEC, "C": DEC, "D": DEC, "E": NUM, "F": NUM, "L": '0.0', "W": PCT, "AA": PCT, "AB": PCT,
            "AC": '0.0000'}
    for colL, formula in f.items():
        c = wc[f"{colL}{r}"]
        c.value = formula
        c.border = BOX
        c.font = GREEN if colL in ("A", "O", "U") else BLACK
        if colL in "GHIJK":
            c.number_format = '0.0'
        elif colL in fmts:
            c.number_format = fmts[colL]
        elif colL in ("M", "N", "O", "P", "Q", "R", "S", "U", "V", "Z", "AD", "AE"):
            c.number_format = EUR
# totals
tr = 4 + N
wc.cell(row=tr, column=1, value="Totaal").font = BOLD
for colL in ["L", "M", "N", "O", "P", "S", "R", "U", "V", "Y", "Z", "AD", "AE"]:
    c = wc[f"{colL}{tr}"]
    c.value = f"=SUM({colL}4:{colL}{tr - 1})"
    c.font = BOLD
    c.number_format = '0.0' if colL in ("L", "Y") else EUR
for i in range(1, len(B_HEADS) + 1):
    wc.column_dimensions[L(i)].width = 13
wc.column_dimensions["T"].width = 30
wc.column_dimensions["AC"].hidden = True
wc.freeze_panes = "B4"
red = PatternFill("solid", fgColor="F8CBAD")
orange = PatternFill("solid", fgColor="FFE699")
green = PatternFill("solid", fgColor="C6EFCE")
for rng in [f"X4:X{tr - 1}"]:
    wc.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"ROOD"'], fill=red))
    wc.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"ORANJE"'], fill=orange))
    wc.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"GROEN"'], fill=green))

# ---------- Portefeuille ----------
wf = wb.create_sheet("Portefeuille")
wf["A1"] = "Portefeuilleoverzicht - opdrachten gerangschikt op begrote marge (laagste eerst)"
wf["A1"].font = TITLE
wf["A2"] = "Basis voor het gesprek met de partner. Ongekalibreerd basismodel."
wf["A2"].font = Font(name=F, italic=True)
P_HEADS = ["Rang", "Opdrachtcode", "Signaal", "Huidig honorarium (€)", "Kostprijs (€)", "Minimumprijs (€)",
           "Adviesprijs (€)", "Begrote marge bij huidig honorarium", "Tekort t.o.v. minimumprijs (€)",
           "Gerealiseerde marge (werkelijke uren)", "Afwijking uren", "Rij (hulp)"]
for i, h in enumerate(P_HEADS, start=1):
    wf.cell(row=4, column=i, value=h)
style_header(wf, 4, len(P_HEADS))
B = "Berekening!"
for k in range(N):
    r = 5 + k
    wf[f"A{r}"] = k + 1
    wf[f"L{r}"] = (f'=IF(A{r}>COUNT({B}$AC$4:$AC${3 + N}),"",'
                   f'MATCH(SMALL({B}$AC$4:$AC${3 + N},A{r}),{B}$AC$4:$AC${3 + N},0))')
    m = {"B": "A", "C": "X", "D": "U", "E": "P", "F": "R", "G": "S", "H": "W", "I": "AD", "J": "AA", "K": "AB"}
    for col, src in m.items():
        wf[f"{col}{r}"] = f'=IF($L{r}="","",INDEX({B}${src}$4:${src}${3 + N},$L{r}))'
        wf[f"{col}{r}"].font = GREEN
    for col in "ABCDEFGHIJKL":
        wf[f"{col}{r}"].border = BOX
    for col in "DEFGI":
        wf[f"{col}{r}"].number_format = EUR
    for col in "HJK":
        wf[f"{col}{r}"].number_format = PCT
rr = 5 + N + 1
summary = [
    ("Aantal opdrachten met honorarium", f'=COUNT({B}AC4:AC{3 + N})', NUM),
    ("Aantal ROOD (onder minimumprijs)", f'=COUNTIF({B}X4:X{3 + N},"ROOD")', NUM),
    ("Aantal ORANJE (tussen minimum en advies)", f'=COUNTIF({B}X4:X{3 + N},"ORANJE")', NUM),
    ("Aantal GROEN (op of boven advies)", f'=COUNTIF({B}X4:X{3 + N},"GROEN")', NUM),
    ("Totaal huidig honorarium (€)", f'=SUM({B}U4:U{3 + N})', EUR),
    ("Totaal adviesprijs (€)", f'=SUM({B}S4:S{3 + N})', EUR),
    ("Totaal tekort t.o.v. minimumprijs (€)", f'=SUM({B}AD4:AD{3 + N})', EUR),
    ("Totaal tekort t.o.v. adviesprijs (€)", f'=SUM({B}AE4:AE{3 + N})', EUR),
]
wf.cell(row=rr, column=1, value="Samenvatting").font = BOLD
for i, (lab, fm, fmt) in enumerate(summary):
    wf.cell(row=rr + 1 + i, column=1, value=lab)
    c = wf.cell(row=rr + 1 + i, column=4, value=fm)
    c.number_format, c.font = fmt, GREEN
for i, w in enumerate([7, 14, 10, 15, 14, 14, 14, 15, 15, 15, 12, 8], start=1):
    wf.column_dimensions[L(i)].width = w
wf.column_dimensions["L"].hidden = True
rng = f"C5:C{4 + N}"
wf.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"ROOD"'], fill=red))
wf.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"ORANJE"'], fill=orange))
wf.conditional_formatting.add(rng, CellIsRule(operator="equal", formula=['"GROEN"'], fill=green))

for sh in wb.worksheets:
    for row in sh.iter_rows():
        for c in row:
            fnt = c.font
            if fnt.name != F:
                c.font = Font(name=F, bold=fnt.bold, italic=fnt.italic, color=fnt.color, size=fnt.size)
wb.save("KISS-margescan-rekenmodel.xlsx")
print("ok")
