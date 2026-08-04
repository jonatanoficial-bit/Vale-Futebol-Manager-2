#!/usr/bin/env python3
"""Importa clubes/elencos atuais da base CC0 transfermarkt-datasets.

Os dados factuais (nomes, posicoes, nascimento, clube, contrato e valor) vem
dos CSVs CC0. GER/potencial/salario sao estimativas transparentes do VFM e nao
ratings oficiais da FIFA, EA ou Transfermarkt.
"""

from __future__ import annotations

import argparse
import csv
import gzip
import json
import math
import re
import unicodedata
import urllib.request
from collections import defaultdict
from datetime import date, datetime
from difflib import SequenceMatcher
from pathlib import Path


LEAGUES = {
    "ARG1": ("argentina-primera", "Liga Profesional", "argentina", "Argentina", "south-america", "CONMEBOL", 28, 76),
    "MLS1": ("mls", "Major League Soccer", "usa", "Estados Unidos", "north-america", "CONCACAF", 30, 74),
    "BRA1": ("brasileirao-a", "Brasileirao Serie A", "brazil", "Brasil", "south-america", "CONMEBOL", 20, 78),
    "IT1": ("serie-a-italia", "Serie A", "italy", "Italia", "europe", "UEFA", 20, 82),
    "COL1": ("colombia-primera-a", "Categoria Primera A", "colombia", "Colombia", "south-america", "CONMEBOL", 20, 73),
    "JAP1": ("j1-league", "J1 League", "japan", "Japao", "asia", "AFC", 20, 72),
    "ES1": ("laliga", "LaLiga", "spain", "Espanha", "europe", "UEFA", 20, 84),
    "GB1": ("premier-league", "Premier League", "england", "Inglaterra", "europe", "UEFA", 20, 86),
    "FR1": ("ligue-1", "Ligue 1", "france", "Franca", "europe", "UEFA", 18, 81),
    "TR1": ("super-lig", "Super Lig", "turkey", "Turquia", "europe", "UEFA", 18, 77),
    "PO1": ("liga-portugal", "Liga Portugal", "portugal", "Portugal", "europe", "UEFA", 18, 79),
    "NL1": ("eredivisie", "Eredivisie", "netherlands", "Paises Baixos", "europe", "UEFA", 18, 78),
    "SA1": ("saudi-pro", "Saudi Pro League", "saudi-arabia", "Arabia Saudita", "asia", "AFC", 18, 77),
    "MEX1": ("liga-mx", "Liga MX", "mexico", "Mexico", "north-america", "CONCACAF", 18, 75),
    "L1": ("bundesliga", "Bundesliga", "germany", "Alemanha", "europe", "UEFA", 18, 83),
    "PL1": ("poland-ekstraklasa", "Ekstraklasa", "poland", "Polonia", "europe", "UEFA", 18, 72),
    "SE1": ("sweden-allsvenskan", "Allsvenskan", "sweden", "Suecia", "europe", "UEFA", 16, 70),
    "NO1": ("norway-eliteserien", "Eliteserien", "norway", "Noruega", "europe", "UEFA", 16, 70),
    "UKR1": ("ukraine-premier", "Ukrainian Premier League", "ukraine", "Ucrania", "europe", "UEFA", 16, 72),
    "RU1": ("russia-premier", "Russian Premier League", "russia", "Russia", "europe", "UEFA", 16, 74),
    "BE1": ("belgian-pro", "Belgian Pro League", "belgium", "Belgica", "europe", "UEFA", 16, 76),
    "TS1": ("czech-first", "Czech First League", "czechia", "Tchequia", "europe", "UEFA", 16, 71),
    "SER1": ("serbia-superliga", "Serbian SuperLiga", "serbia", "Servia", "europe", "UEFA", 16, 70),
    "RO1": ("romania-liga-1", "Liga I", "romania", "Romenia", "europe", "UEFA", 16, 70),
    "GR1": ("super-league-greece", "Super League Greece", "greece", "Grecia", "europe", "UEFA", 14, 73),
    "DK1": ("denmark-superliga", "Danish Superliga", "denmark", "Dinamarca", "europe", "UEFA", 12, 72),
    "AUS1": ("a-league", "A-League Men", "australia", "Australia", "asia", "AFC", 12, 69),
    "SC1": ("scottish-premiership", "Scottish Premiership", "scotland", "Escocia", "europe", "UEFA", 12, 73),
    "A1": ("austrian-bundesliga", "Austrian Bundesliga", "austria", "Austria", "europe", "UEFA", 12, 73),
    "RSK1": ("k-league-1", "K League 1", "south-korea", "Coreia do Sul", "asia", "AFC", 12, 71),
    "C1": ("swiss-super-league", "Swiss Super League", "switzerland", "Suica", "europe", "UEFA", 12, 73),
    "KR1": ("croatia-hnl", "Croatian Football League", "croatia", "Croacia", "europe", "UEFA", 10, 71),
}

ALIASES = {
    "internazionale": "inter milan", "fc internazionale milano": "inter milan",
    "paris saint germain football club": "paris saint germain", "manchester united football club": "manchester united",
    "manchester city football club": "manchester city", "sport lisboa e benfica": "benfica",
    "sociedade esportiva palmeiras": "palmeiras", "clube de regatas do flamengo": "flamengo",
    "club atletico river plate": "river plate", "club atletico boca juniors": "boca juniors",
}


def slug(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-") or "club"


def key(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    value = re.sub(r"\b(fc|cf|sc|afc|ac|fk|sk|club|football|futebol|deportivo|sociedade|esporte)\b", " ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value).strip()
    return ALIASES.get(value, value)


def read_gzip_csv(path: Path) -> list[dict[str, str]]:
    with gzip.open(path, "rt", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def age_on_2026_08_04(value: str) -> int:
    try:
        born = datetime.fromisoformat(value.split()[0]).date()
        today = date(2026, 8, 4)
        return today.year - born.year - ((today.month, today.day) < (born.month, born.day))
    except Exception:
        return 24


def position(row: dict[str, str]) -> tuple[str, str]:
    sub = row.get("sub_position", "")
    mapping = {
        "Goalkeeper": "GOL", "Centre-Back": "ZAG", "Right-Back": "LD", "Left-Back": "LE",
        "Defensive Midfield": "VOL", "Central Midfield": "MC", "Attacking Midfield": "MEI",
        "Right Midfield": "MD", "Left Midfield": "ME", "Right Winger": "PD", "Left Winger": "PE",
        "Second Striker": "SA", "Centre-Forward": "ATA",
    }
    return mapping.get(sub, {"Defender": "ZAG", "Midfield": "MC", "Attack": "ATA"}.get(row.get("position"), "MC")), sub or row.get("position") or "Jogador"


def overall(value: int, age: int, pos: str) -> int:
    # Escala propria VFM: logaritmica, limitada e levemente corrigida por idade/posicao.
    base = 55 + 8.5 * math.log10(1 + max(0, value) / 100_000)
    if value <= 0:
        base = 58
    if 24 <= age <= 29:
        base += 1
    if pos == "GOL" and age >= 30:
        base += 1
    return max(48, min(92, round(base)))


def rule_for(confed: str, size: int) -> dict:
    continental_id = {"UEFA": "champions-league", "CONMEBOL": "libertadores", "CONCACAF": "concacaf-champions-cup", "AFC": "afc-champions-league"}.get(confed, "continental-cup")
    return {
        "teams": size, "format": "double-round-robin", "promotion": 0, "relegation": 2 if size <= 16 else 3,
        "continental": {continental_id: [1, min(4, size)]},
        "verification": "competition-format-review-required",
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    parser.add_argument("--clubs", type=Path, required=True)
    parser.add_argument("--players", type=Path, required=True)
    parser.add_argument("--download-badges", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    catalog_path = root / "data" / "world-catalog-2026.json"
    catalog = json.loads(catalog_path.read_text(encoding="utf-8"))
    source_clubs = [r for r in read_gzip_csv(args.clubs) if r.get("last_season") == "2025" and r.get("domestic_competition_id") in LEAGUES]
    source_players = [r for r in read_gzip_csv(args.players) if r.get("last_season") == "2025" and r.get("current_club_domestic_competition_id") in LEAGUES]
    players_by_club: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in source_players:
        players_by_club[row.get("current_club_id", "")].append(row)

    leagues_by_id = {row["id"]: row for row in catalog["leagues"]}
    for comp_id, spec in LEAGUES.items():
        league_id, name, country_id, country, continent, confed, size, rating = spec
        if league_id not in leagues_by_id:
            league = {"id": league_id, "name": name, "continent": continent, "countryId": country_id, "country": country, "confederation": confed, "division": 1, "baseRating": rating, "rules": rule_for(confed, size), "logo": "assets/placeholders/club-generic.png", "sourceCompetitionId": comp_id}
            catalog["leagues"].append(league)
            leagues_by_id[league_id] = league
        leagues_by_id[league_id]["rules"]["teams"] = size

    imported = matched = added = badges = 0
    claimed_catalog_clubs: set[tuple[str, str]] = set()
    match_scores: list[float] = []
    clubs_by_league: dict[str, list[dict]] = defaultdict(list)
    for row in catalog["clubs"]:
        clubs_by_league[row["leagueId"]].append(row)

    for src in source_clubs:
        comp_id = src["domestic_competition_id"]
        league_id, league_name, country_id, country, continent, confed, _, base_rating = LEAGUES[comp_id]
        roster_rows = players_by_club.get(src["club_id"], [])
        if len(roster_rows) < 11:
            continue
        src_key = key(src["name"])
        candidates = [candidate for candidate in clubs_by_league[league_id] if (league_id, candidate["id"]) not in claimed_catalog_clubs]
        best = None
        score = 0.0
        for candidate in candidates:
            candidate_score = SequenceMatcher(None, src_key, key(candidate["name"])).ratio()
            if candidate_score > score:
                score, best = candidate_score, candidate
        if best is None or score < 0.64:
            base_slug = slug(src["club_code"] or src["name"])
            unique_id = base_slug
            used = {c["id"] for c in catalog["clubs"] if c["leagueId"] == league_id}
            if unique_id in used:
                unique_id = f"{base_slug}-{src['club_id']}"
            best = {"id": unique_id, "name": src["name"], "continent": continent, "countryId": country_id, "country": country, "confederation": confed, "leagueId": league_id, "leagueName": league_name, "division": 1, "rating": base_rating, "stadium": src.get("stadium_name") or "Estadio do clube"}
            catalog["clubs"].append(best)
            clubs_by_league[league_id].append(best)
            added += 1
        else:
            matched += 1
            match_scores.append(score)
        claimed_catalog_clubs.add((league_id, best["id"]))

        badge_rel = f"assets/clubs/imported/{comp_id.lower()}/{slug(src['club_code'] or src['name'])}.png"
        roster_rel = f"data/rosters/cc0-2026/{comp_id.lower()}/{slug(src['club_code'] or src['name'])}.json"
        roster = []
        for index, row in enumerate(sorted(roster_rows, key=lambda r: int(r.get("market_value_in_eur") or 0), reverse=True)):
            player_age = age_on_2026_08_04(row.get("date_of_birth", ""))
            if not 15 <= player_age <= 45:
                continue
            pos, role = position(row)
            market = int(row.get("market_value_in_eur") or 0)
            ger = overall(market, player_age, pos)
            potential = max(ger, min(94, ger + max(0, 24 - player_age) // 2 + (2 if player_age <= 21 else 0)))
            roster.append({
                "id": f"tm-{row['player_id']}", "name": row.get("name") or f"Jogador {index + 1}", "pos": pos, "role": role,
                "overall": ger, "potential": potential, "age": player_age, "morale": 74, "fitness": 90,
                "salary": max(25, round((market / 1_000_000) * 18)), "value": round(market / 1_000_000, 3),
                "nationality": row.get("country_of_citizenship") or "", "foot": row.get("foot") or "",
                "height": int(row.get("height_in_cm") or 0), "contractUntil": (row.get("contract_expiration_date") or "2027-06-30")[:10],
                "internationalCaps": int(row.get("international_caps") or 0), "internationalGoals": int(row.get("international_goals") or 0),
                "photoRemote": row.get("image_url") or "", "dataSource": "transfermarkt-datasets-CC0-snapshot-2026-08-04",
            })
        if len(roster) < 11:
            continue
        roster_path = root / roster_rel
        roster_path.parent.mkdir(parents=True, exist_ok=True)
        roster_path.write_text(json.dumps({"meta": {"clubId": best["id"], "clubName": src["name"], "season": 2026, "updatedAt": "2026-08-04", "status": "real-names-CC0", "sourceClubId": src["club_id"], "ratingMethod": "VFM estimate; not official FIFA/EA"}, "players": roster}, ensure_ascii=False, indent=2), encoding="utf-8")
        best.update({"name": src["name"], "rosterPath": roster_rel, "players": len(roster), "badge": badge_rel, "logo": badge_rel, "stadium": src.get("stadium_name") or best.get("stadium") or "Estadio do clube", "simulationOnly": False, "sourceClubId": src["club_id"], "dataStatus": "real-names-CC0-2026"})
        best["rating"] = round(sum(p["overall"] for p in sorted(roster, key=lambda p: p["overall"], reverse=True)[:18]) / min(18, len(roster)))
        imported += 1

        if args.download_badges:
            target = root / badge_rel
            target.parent.mkdir(parents=True, exist_ok=True)
            try:
                request = urllib.request.Request(f"https://tmssl.akamaized.net/images/wappen/head/{src['club_id']}.png", headers={"User-Agent": "Mozilla/5.0 VFM personal data importer"})
                with urllib.request.urlopen(request, timeout=30) as response:
                    payload = response.read()
                if payload.startswith(b"\x89PNG") and len(payload) > 500:
                    target.write_bytes(payload)
                    badges += 1
            except Exception:
                pass

    catalog["version"] = "11.0.0"
    catalog["season"] = 2026
    catalog["generatedFrom"] = "VFM original pack + transfermarkt-datasets CC0 snapshot 2026-08-04"
    catalog["clubs"].sort(key=lambda c: (c["continent"], c["country"], c["leagueId"], c["name"]))
    catalog["leagues"].sort(key=lambda l: (l["continent"], l["country"], l["division"], l["name"]))
    catalog["stats"].update({
        "playableClubs": sum(bool(c.get("rosterPath")) for c in catalog["clubs"]),
        "simulationClubs": len(catalog["clubs"]),
        "clubPlayers": sum(int(c.get("players") or 0) for c in catalog["clubs"] if c.get("rosterPath")),
        "realDataImportedClubs": imported,
        "realBadgeFiles": sum(1 for c in catalog["clubs"] if c.get("badge") and (root / c["badge"]).exists() and "generic" not in c["badge"]),
        "dataSnapshot": "2026-08-04",
    })
    catalog_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
    report = {"imported": imported, "matchedExisting": matched, "added": added, "downloadedBadges": badges, "meanMatchScore": round(sum(match_scores) / len(match_scores), 3) if match_scores else 0, "playableClubs": catalog["stats"]["playableClubs"], "simulationClubs": len(catalog["clubs"]), "clubPlayers": catalog["stats"]["clubPlayers"], "leagues": len(catalog["leagues"])}
    (root / "IMPORT-CC0-REPORT.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False))


if __name__ == "__main__":
    main()
