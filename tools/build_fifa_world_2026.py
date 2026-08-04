from __future__ import annotations

import html
import json
import math
import re
import sys
import unicodedata
from datetime import date, datetime
from pathlib import Path

import pdfplumber

ROOT = Path(__file__).resolve().parents[1]
WORKSPACE = ROOT.parents[1]
PDF = WORKSPACE / "tmp" / "pdfs" / "FIFA-World-Cup-2026-SquadLists-English.pdf"
ASSOCIATIONS_HTML = WORKSPACE / "tmp" / "fifa-associations.html"
OUTPUT = ROOT / "data" / "fifa-associations-2026.json"
ROSTER_DIR = ROOT / "data" / "rosters" / "2026" / "fifa-world-cup"

FLAG_MAP = {
    "ARG":"ar","BEL":"be","BOL":"bo","BRA":"br","CHI":"cl","COL":"co","GER":"de","ECU":"ec",
    "ESP":"es","FRA":"fr","ENG":"gb","ITA":"it","MEX":"mx","NED":"nl","PER":"pe","POR":"pt",
    "PAR":"py","KSA":"sa","TUR":"tr","USA":"us","URU":"uy","VEN":"ve",
}

CONFEDERATION_SLOTS = {"AFC":8,"CAF":9,"CONCACAF":6,"CONMEBOL":6,"OFC":1,"UEFA":16}
CONFEDERATION_BASE = {"UEFA":68,"CONMEBOL":70,"CAF":63,"AFC":62,"CONCACAF":61,"OFC":57}


def clean(value: object) -> str:
    text = str(value or "").replace("\x00", "")
    return re.sub(r"\s+", " ", text).strip()


def slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")


def age_on(dob: str, reference: date = date(2026, 8, 3)) -> int:
    born = datetime.strptime(dob, "%d/%m/%Y").date()
    return reference.year - born.year - ((reference.month, reference.day) < (born.month, born.day))


def vfm_rating(caps: int, goals: int, player_age: int, team_strength: int, position: str) -> int:
    # Índice próprio e transparente do jogo. Não representa nota oficial FIFA, EA ou Football Manager.
    experience = min(13, math.sqrt(max(0, caps)) * 1.35)
    production = min(5, math.sqrt(max(0, goals)) * (0.75 if position == "FW" else 0.45))
    age_curve = 2 if 23 <= player_age <= 29 else 0 if player_age <= 33 else -2
    return max(58, min(94, round(team_strength - 10 + experience + production + age_curve)))


raw = ASSOCIATIONS_HTML.read_text(encoding="utf-8", errors="replace")
pattern = re.compile(r'\{"name":"(?P<name>[^"\\]*(?:\\.[^"\\]*)*)","confederation":"(?P<confed>[A-Z]+)","flag":\{.*?\},"url":"/associations/(?P<code>[A-Z]{3})"\}')
associations = []
seen = set()
for match in pattern.finditer(raw):
    code = match.group("code")
    if code in seen:
        continue
    seen.add(code)
    name = html.unescape(json.loads('"' + match.group("name") + '"'))
    confed = match.group("confed")
    associations.append({
        "id": code.lower(), "code": code, "name": name, "confederation": confed,
        "simulationStrength": CONFEDERATION_BASE.get(confed, 60), "reputationRequired": 45,
        "worldCupSlots": CONFEDERATION_SLOTS.get(confed, 0), "rosterPath": None, "players": 0,
        "badge": f"assets/countries/{FLAG_MAP[code]}.png" if code in FLAG_MAP else "assets/placeholders/club-generic.png",
        "source": "FIFA Member Associations", "sourceDate": "2026-08-03",
    })

if len(associations) != 211:
    raise RuntimeError(f"Esperadas 211 associações FIFA, encontradas {len(associations)}")

by_name = {slug(item["name"]): item for item in associations}
ALIASES = {
    "bosnia-and-herzegovina":"bosnia-herzegovina", "cote-d-ivoire":"cote-divoire", "iran":"ir-iran",
    "korea-republic":"korea-republic", "usa":"usa", "curacao":"curacao", "turkiye":"turkiye",
}
positions = {"GK":"GOL","DF":"ZAG","MF":"MC","FW":"ATA"}
role_names = {"GK":"Goleiro","DF":"Defensor","MF":"Meio-campista","FW":"Atacante"}
ROSTER_DIR.mkdir(parents=True, exist_ok=True)

pdf_meta = {}
with pdfplumber.open(PDF) as pdf:
    pdf_meta = {"pages": len(pdf.pages), "createdAt": "2026-07-19T22:34:35Z"}
    for page_index, page in enumerate(pdf.pages):
        page_text = page.extract_text() or ""
        text_lines = [clean(line) for line in page_text.splitlines() if clean(line)]
        team_line = next((line for line in text_lines[:8] if re.match(r"^.+? \([A-Z]{3}\)$", line)), "")
        team_match = re.match(r"(.+?) \(([A-Z]{3})\)$", team_line)
        if not team_match:
            raise RuntimeError(f"Seleção não identificada na página {page_index + 1}: {text_lines[:8]}")
        team_name, code = team_match.groups()
        association = next((item for item in associations if item["code"] == code), None)
        if association is None:
            association = by_name.get(ALIASES.get(slug(team_name), slug(team_name)))
        if association is None:
            raise RuntimeError(f"Associação FIFA não encontrada: {team_name} ({code})")
        tables = page.extract_tables()
        if not tables or len(tables[0]) < 27:
            raise RuntimeError(f"Tabela incompleta na página {page_index + 1}")
        header = [clean(value) for value in tables[0][0]]
        def column(label: str) -> int:
            try:
                return header.index(label)
            except ValueError as exc:
                raise RuntimeError(f"Coluna {label!r} ausente na página {page_index + 1}: {header!r}") from exc
        columns = {
            "number": column("#"), "position": column("POS"), "first": column("FIRST NAME(S)"),
            "last": column("LAST NAME(S)"), "dob": column("DOB"), "club": column("CLUB"),
            "caps": column("CAPS"), "goals": column("GOALS"),
        }
        rows = tables[0][1:27]
        players = []
        team_strength = CONFEDERATION_BASE.get(association["confederation"], 62) + 8
        for row in rows:
            cell = lambda index: clean(row[index]) if index < len(row) else ""
            if not row or cell(columns["position"]) not in positions:
                continue
            shirt = int(cell(columns["number"]) or len(players) + 1)
            official_position = cell(columns["position"])
            first_names, last_names = cell(columns["first"]), cell(columns["last"])
            player_name = clean((first_names + " " + last_names).title())
            dob, club = cell(columns["dob"]), cell(columns["club"])
            caps = int(cell(columns["caps"]) or 0)
            goals = int(cell(columns["goals"]) or 0)
            if not re.fullmatch(r"\d{2}/\d{2}/\d{4}", dob):
                raise RuntimeError(
                    f"DOB inválida página {page_index + 1} {team_name}: {dob!r}; "
                    f"header={tables[0][0]!r}; row={row!r}"
                )
            player_age = age_on(dob)
            rating = vfm_rating(caps, goals, player_age, team_strength, official_position)
            players.append({
                "id": f"{association['id']}-{slug(player_name)}", "name": player_name, "displayName": player_name,
                "pos": positions[official_position], "position": positions[official_position], "role": role_names[official_position],
                "officialPosition": official_position, "overall": rating, "potential": max(rating, min(94, rating + max(0, 25-player_age)//2)),
                "age": player_age, "birthDate": datetime.strptime(dob, "%d/%m/%Y").strftime("%Y-%m-%d"),
                "clubName": club, "shirt": shirt, "shirtNumber": shirt, "caps": caps, "goals": goals,
                "salary": 0, "value": 0, "marketValue": 0, "fitness": 90, "morale": 78,
                "source": "FIFA World Cup 2026 official squad list", "sourceDate": "2026-07-19",
                "ratingModel": "VFM index from team strength, caps, goals and age; not an official FIFA/EA/FM rating",
            })
        if len(players) != 26:
            raise RuntimeError(f"{team_name}: esperados 26 jogadores, encontrados {len(players)}")
        path = ROSTER_DIR / f"{association['id']}.json"
        payload = {
            "meta": {
                "teamId": association["id"], "teamCode": code, "teamName": association["name"],
                "confederation": association["confederation"], "season": 2026, "players": 26,
                "source": "FIFA World Cup 2026 Squad Lists", "sourceUrl": "https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf",
                "sourcePublishedAt": "2026-07-19T22:34:35Z", "dataReferenceDate": "2026-07-19",
                "ratingDisclosure": "Overall is a proprietary VFM simulation index, not an official FIFA, EA Sports or Football Manager rating."
            },
            "players": players,
        }
        path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        average = round(sum(player["overall"] for player in players) / len(players))
        association.update({
            "rosterPath": path.relative_to(ROOT).as_posix(), "players": 26, "simulationStrength": average,
            "reputationRequired": max(50, min(86, average - 5)), "officialSquad": True,
            "source": "FIFA World Cup 2026 Squad Lists", "sourceDate": "2026-07-19",
        })

for association in associations:
    association.setdefault("officialSquad", False)

result = {
    "version": "2026.08.03", "referenceDate": "2026-08-03", "associations": sorted(associations, key=lambda item: item["name"]),
    "qualification": {
        "memberAssociations": 211, "confederations": 6, "worldCupTeams": 48,
        "slots": CONFEDERATION_SLOTS, "format": "Confederation qualifying followed by a 48-team World Cup",
    },
    "sources": [
        {"title":"FIFA Member Associations", "url":"https://inside.fifa.com/en/about-fifa/associations", "accessedAt":"2026-08-03"},
        {"title":"FIFA World Cup 2026 Squad Lists", "url":"https://fdp.fifa.org/assetspublic/ce281/pdf/SquadLists-English.pdf", "publishedAt":"2026-07-19T22:34:35Z", **pdf_meta},
    ],
}
OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps({
    "associations": len(associations), "officialSquads": sum(bool(item["rosterPath"]) for item in associations),
    "players": sum(item["players"] for item in associations),
    "byConfederation": {confed: sum(item["confederation"] == confed for item in associations) for confed in sorted({item["confederation"] for item in associations})},
}, ensure_ascii=False))
