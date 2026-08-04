from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def load_json(relative: str):
    with (ROOT / relative).open("r", encoding="utf-8") as handle:
        return json.load(handle)


def require(condition: bool, message: str):
    if not condition:
        raise AssertionError(message)


catalog = load_json("data/world-catalog-2026.json")
fifa = load_json("data/fifa-associations-2026.json")
manifest = load_json("manifest.webmanifest")

associations = fifa["associations"]
clubs = catalog["clubs"]
leagues = catalog["leagues"]
stats = catalog["stats"]

require(len(associations) == 211, "O banco FIFA precisa conter 211 associações")
require(len({team["code"] for team in associations}) == 211, "Códigos FIFA duplicados")
require(len(clubs) == stats["simulationClubs"] == 530, "Contagem de clubes divergente")
require(sum(bool(club.get("rosterPath")) for club in clubs) == stats["playableClubs"] == 149, "Clubes jogáveis divergentes")
require(sum(team.get("players", 0) for team in associations) == stats["nationalPlayers"] == 1248, "Jogadores internacionais divergentes")
require(sum(bool(team.get("officialSquad")) for team in associations) == stats["officialNationalSquads"] == 48, "Elencos oficiais divergentes")
require({team["confederation"] for team in associations} == {"AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"}, "Confederações incompletas")
require({club["confederation"] for club in clubs} == {"AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"}, "Clubes não cobrem as seis confederações")

club_players = 0
for club in clubs:
    roster_path = club.get("rosterPath")
    if not roster_path:
        require(club.get("simulationOnly") or club.get("players") == 0, f"Clube sem elenco mal classificado: {club['name']}")
        continue
    path = ROOT / roster_path
    require(path.is_file(), f"Elenco ausente: {roster_path}")
    roster = load_json(roster_path)
    players = roster.get("players", [])
    require(len(players) >= 11, f"Elenco insuficiente: {club['name']}")
    require(all(player.get("name") and isinstance(player.get("overall"), (int, float)) for player in players), f"Jogador inválido: {club['name']}")
    club_players += len(players)
require(club_players == stats["clubPlayers"] == 2902, "Total de jogadores de clubes divergente")

for team in associations:
    roster_path = team.get("rosterPath")
    if not roster_path:
        continue
    path = ROOT / roster_path
    require(path.is_file(), f"Convocação ausente: {roster_path}")
    roster = load_json(roster_path)
    require(len(roster.get("players", [])) == 26, f"Convocação precisa ter 26 jogadores: {team['name']}")
    require("ratingDisclosure" in roster.get("meta", {}), f"Aviso de rating ausente: {team['name']}")

league_ids = {league["id"] for league in leagues}
require(all(club["leagueId"] in league_ids for club in clubs), "Clube aponta para liga inexistente")
require(manifest.get("orientation") == "landscape", "Manifesto precisa exigir orientação horizontal")

html = (ROOT / "index.html").read_text(encoding="utf-8")
for ref in re.findall(r'(?:href|src)="\./([^"?#]+)', html):
    require((ROOT / ref).exists(), f"Referência ausente no index: {ref}")

sw = (ROOT / "sw.js").read_text(encoding="utf-8")
shell_refs = re.findall(r"'\./([^'?]+)(?:\?[^']*)?'", sw)
for ref in shell_refs:
    if ref:
        require((ROOT / ref).exists(), f"Referência ausente no service worker: {ref}")

report = {
    "status": "approved",
    "version": catalog["version"],
    "simulationClubs": len(clubs),
    "playableClubs": stats["playableClubs"],
    "clubPlayers": club_players,
    "fifaAssociations": len(associations),
    "officialNationalSquads": stats["officialNationalSquads"],
    "nationalPlayers": stats["nationalPlayers"],
    "leagues": len(leagues),
    "clubsByConfederation": dict(sorted(Counter(club["confederation"] for club in clubs).items())),
    "associationsByConfederation": dict(sorted(Counter(team["confederation"] for team in associations).items())),
    "checks": [
        "catalog integrity", "club roster paths", "official squad paths", "six-confederation coverage",
        "manifest landscape orientation", "index references", "service-worker shell references", "rating disclosure",
    ],
}

(ROOT / "QA-WORLD-V10.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False))
