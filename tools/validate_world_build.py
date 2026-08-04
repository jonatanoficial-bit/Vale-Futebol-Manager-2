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
rules_doc = load_json("data/rules-2026.json")
manifest = load_json("manifest.webmanifest")

clubs = catalog["clubs"]
leagues = catalog["leagues"]
nationals = catalog["nationalTeams"]
associations = fifa["associations"]
stats = catalog["stats"]

require(catalog["version"] == "11.0.0", "Versão do catálogo divergente")
require(len(associations) == len(nationals) == stats["nationalTeams"] == 211, "O mundo precisa conter 211 associações")
require(len({team["code"] for team in associations}) == 211, "Códigos FIFA duplicados")
require(len({team["code"] for team in nationals}) == 211, "Códigos de seleções duplicados")
require(len(clubs) == stats["simulationClubs"], "Contagem de clubes divergente")
require(len({club["id"] for club in clubs}) == len(clubs), "IDs de clubes duplicados")
require(sum(bool(club.get("rosterPath")) for club in clubs) == stats["playableClubs"], "Clubes jogáveis divergentes")
require(sum(bool(team.get("rosterPath")) for team in nationals) == stats["commandableNationalTeams"], "Seleções comandáveis divergentes")
require(sum(bool(team.get("officialSquad")) for team in nationals) == stats["officialNationalSquads"] == 48, "Elencos oficiais divergentes")
require({team["confederation"] for team in nationals} == {"AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"}, "Confederações de seleções incompletas")
require({club["confederation"] for club in clubs} == {"AFC", "CAF", "CONCACAF", "CONMEBOL", "OFC", "UEFA"}, "Clubes não cobrem as seis confederações")

club_players = 0
badge_paths = set()
generic_badges = 0
for club in clubs:
    badge = club.get("badge", "")
    require(badge, f"Escudo não informado: {club['name']}")
    badge_path = ROOT / badge
    require(badge_path.is_file(), f"Escudo ausente: {badge}")
    badge_paths.add(badge)
    if "placeholder" in badge or "generic" in badge:
        generic_badges += 1

    roster_path = club.get("rosterPath")
    if not roster_path:
        require(club.get("simulationOnly") or club.get("players", 0) == 0, f"Clube sem elenco mal classificado: {club['name']}")
        continue
    require((ROOT / roster_path).is_file(), f"Elenco ausente: {roster_path}")
    players = load_json(roster_path).get("players", [])
    require(len(players) >= 11, f"Elenco insuficiente: {club['name']}")
    require(all(player.get("name") and isinstance(player.get("overall"), (int, float)) for player in players), f"Jogador inválido: {club['name']}")
    club_players += len(players)

require(club_players == stats["clubPlayers"], "Total de jogadores de clubes divergente")
require(len(clubs) - generic_badges == stats["realBadgeFiles"], "Contagem de referências a escudos reais divergente")

national_players = 0
for team in nationals:
    roster_path = team.get("rosterPath")
    if not roster_path:
        continue
    require((ROOT / roster_path).is_file(), f"Convocação ausente: {roster_path}")
    roster = load_json(roster_path)
    players = roster.get("players", [])
    meta = roster.get("meta", {})
    require(len(players) >= 16, f"Pool nacional insuficiente: {team['name']}")
    if team.get("officialSquad"):
        require(len(players) == 26, f"Convocação oficial precisa ter 26 jogadores: {team['name']}")
        require("ratingDisclosure" in meta, f"Aviso de rating ausente: {team['name']}")
    else:
        require("ratingMethod" in meta, f"Método de rating ausente: {team['name']}")
    national_players += len(players)

require(national_players == stats["nationalPlayers"], "Total de jogadores de seleções divergente")

league_ids = {league["id"] for league in leagues}
require(len(league_ids) == len(leagues) == len(rules_doc["leagues"]), "Ligas ou regras divergentes")
require(all(club["leagueId"] in league_ids for club in clubs), "Clube aponta para liga inexistente")
require(all(league.get("rules", {}).get("verification") for league in leagues), "Liga sem status de verificação")
require(manifest.get("orientation") == "landscape", "Manifesto precisa exigir orientação horizontal")

html = (ROOT / "index.html").read_text(encoding="utf-8")
for ref in re.findall(r'(?:href|src)="\./([^"?#]+)', html):
    require((ROOT / ref).exists(), f"Referência ausente no index: {ref}")
require("app-v11.js" in html and "world-edition-v11.css" in html, "Entrypoints V11 ausentes")

sw = (ROOT / "sw.js").read_text(encoding="utf-8")
require("world-v11.0.0" in sw, "Cache do service worker não é V11")
for ref in re.findall(r"'\./([^'?]+)(?:\?[^']*)?'", sw):
    if ref:
        require((ROOT / ref).exists(), f"Referência ausente no service worker: {ref}")

avatar_atlas = ROOT / "assets/avatars/manager-photoreal-atlas-v11.png"
require(avatar_atlas.is_file() and avatar_atlas.stat().st_size > 500_000, "Atlas fotográfico dos treinadores ausente ou inválido")
app_js = (ROOT / "js/app-v11.js").read_text(encoding="utf-8")
require(len(set(re.findall(r"avatar-sprite-(\d+)", (ROOT / "css/world-edition-v11.css").read_text(encoding="utf-8")))) == 16, "Sprites de avatar incompletos")
require("buildWorldFixtures(session.selectedClub" not in app_js, "Mundial não pode ser concedido por rating na primeira temporada")

verification_counts = Counter(league.get("rules", {}).get("verification") for league in leagues)
report = {
    "status": "approved-with-disclosures" if generic_badges else "approved",
    "version": catalog["version"],
    "simulationClubs": len(clubs),
    "playableClubs": stats["playableClubs"],
    "clubPlayers": club_players,
    "fifaAssociations": len(nationals),
    "commandableNationalTeams": stats["commandableNationalTeams"],
    "officialNationalSquads": stats["officialNationalSquads"],
    "nationalPlayers": national_players,
    "leagues": len(leagues),
    "realBadgeReferences": len(clubs) - generic_badges,
    "genericBadgeReferences": generic_badges,
    "uniqueBadgeFilesReferenced": len(badge_paths),
    "managerFaces": stats["managerAvatars"],
    "clubsByConfederation": dict(sorted(Counter(club["confederation"] for club in clubs).items())),
    "nationalTeamsByConfederation": dict(sorted(Counter(team["confederation"] for team in nationals).items())),
    "ruleVerification": dict(sorted(verification_counts.items())),
    "disclosures": [
        f"{generic_badges} clubes de simulação ainda usam escudo genérico; não são anunciados como escudos reais.",
        "GER e potencial são índices próprios do VFM, não ratings oficiais FIFA/EA/FM.",
        "Regras marcadas como aproximação não reproduzem integralmente splits, médias e playoffs.",
    ],
    "checks": [
        "catalog integrity", "unique club IDs", "club and national roster paths", "six-confederation coverage",
        "league rule status", "manifest landscape orientation", "index references", "service-worker shell references",
        "manager face atlas", "world cup qualification gate", "rating disclosure",
    ],
}

(ROOT / "QA-WORLD-V11.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False))
