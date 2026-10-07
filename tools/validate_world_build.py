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

require(catalog["version"] == "16.0.0", "Versão do catálogo divergente")
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
    badge = team.get("badge", "")
    require(badge.startswith("assets/national/flags/") and (ROOT / badge).is_file(), f"Identidade nacional local ausente: {team['name']}")
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
require(manifest.get("orientation") == "any", "Manifesto precisa permitir retrato e paisagem")

html = (ROOT / "index.html").read_text(encoding="utf-8")
for ref in re.findall(r'(?:href|src)="\./([^"?#]+)', html):
    require((ROOT / ref).exists(), f"Referência ausente no index: {ref}")
require("app-v16.js" in html and "ultimate-v16.css" in html, "Entrypoints V16 ausentes")

sw = (ROOT / "sw.js").read_text(encoding="utf-8")
require("ultimate-v24.0.0-phase18" in sw, "Cache do service worker não corresponde à Fase 18")
for ref in re.findall(r"'\./([^'?]+)(?:\?[^']*)?'", sw):
    if ref:
        require((ROOT / ref).exists(), f"Referência ausente no service worker: {ref}")

avatar_atlas = ROOT / "assets/avatars/manager-photoreal-atlas-v11.png"
require(avatar_atlas.is_file() and avatar_atlas.stat().st_size > 500_000, "Atlas fotográfico dos treinadores ausente ou inválido")
app_js = (ROOT / "js/app-v16.js").read_text(encoding="utf-8")
require(len(set(re.findall(r"avatar-sprite-(\d+)", (ROOT / "css/world-edition-v11.css").read_text(encoding="utf-8")))) == 16, "Sprites de avatar incompletos")
for marker in ["liveTacticsPanel", "yearCalendar", "simulateWorldWeek", "showPostMatchInterview", "renderFacilitiesCampus", "generateSponsorOffers"]:
    require(marker in app_js, f"Módulo V16 ausente: {marker}")
for marker in ["positionClass", "formation-face", "live-position", "playerPortrait(player,'small')"]:
    require(marker in app_js, f"Interface tática da Fase 6 incompleta: {marker}")
for marker in ["CAREER_PERFORMANCE_VERSION", "applyMatchConsequences", "applyTrainingWeek", "processSeasonAging", "rosterHealthSummary"]:
    require(marker in app_js, f"Integração esportiva da Fase 7 incompleta: {marker}")
premium_css = (ROOT / "css/ultimate-v16.css").read_text(encoding="utf-8")
for marker in ["Fase 6", "position-gk", "position-def", "position-mid", "position-att", "--nav-accent"]:
    require(marker in premium_css, f"Identidade visual da Fase 6 incompleta: {marker}")
for marker in ["Fase 7", "performance-command", "player-performance-grid", "medical-status"]:
    require(marker in premium_css, f"Interface de performance da Fase 7 incompleta: {marker}")
engine_v2 = (ROOT / "js/systems/matchEngineV2.js").read_text(encoding="utf-8")
for marker in ["createMatchEngineV2", "advanceMatchEngineV2", "applyManagerShoutV2", "buildMatchReport", "MATCH_ENGINE_V2_VERSION"]:
    require(marker in engine_v2, f"Motor de partida Fase 5 incompleto: {marker}")
performance_v3 = (ROOT / "js/systems/careerPerformanceV3.js").read_text(encoding="utf-8")
economy = (ROOT / "js/systems/clubEconomy.js").read_text(encoding="utf-8")
for marker in ["processEconomy", "financeForecast", "startConstruction", "validateDeal", "acceptSale"]:
    require(marker in economy and marker in app_js, f"Integração econômica incompleta: {marker}")
manager_career = (ROOT / "js/systems/managerCareer.js").read_text(encoding="utf-8")
for marker in ["ensureManagerCareer", "reviewManagerMatch", "createClubJobOffers", "createNationalJobOffers", "recordClubAppointment"]:
    require(marker in manager_career and marker in app_js, f"Integração da carreira do treinador incompleta: {marker}")
competition_career = (ROOT / "js/systems/competitionCareer.js").read_text(encoding="utf-8")
for marker in ["deriveCompetitionTable", "competitionKind", "nextCareerEvent", "seasonTrophies", "managerCareerScore"]:
    require(marker in competition_career and marker in app_js, f"Integração da carreira competitiva incompleta: {marker}")
competition_world = (ROOT / "js/systems/competitionWorldV2.js").read_text(encoding="utf-8")
relations = (ROOT / "js/systems/careerRelations.js").read_text(encoding="utf-8")
tactical_roles = (ROOT / "js/systems/tacticalRoles.js").read_text(encoding="utf-8")
competition_formats = (ROOT / "js/systems/competitionFormatsV3.js").read_text(encoding="utf-8")
market_intelligence = (ROOT / "js/systems/marketIntelligenceV3.js").read_text(encoding="utf-8")
world_tournaments = (ROOT / "js/systems/worldTournamentV3.js").read_text(encoding="utf-8")
national_career = (ROOT / "js/systems/nationalCareerV3.js").read_text(encoding="utf-8")
regulations = (ROOT / "js/systems/regulationEngineV4.js").read_text(encoding="utf-8")
rival_career = (ROOT / "js/systems/rivalCareerV4.js").read_text(encoding="utf-8")
for marker in ["createCompetitionWorld", "buildRoundRobinRounds", "recordManagedCompetitionResult", "simulateCompetitionRound"]:
    require(marker in competition_world, f"Motor de calendário Fase 11 incompleto: {marker}")
for marker in ["createCompetitionWorld", "recordManagedCompetitionResult", "simulateCompetitionRound"]:
    require(marker in app_js, f"Integração do calendário Fase 11 incompleta: {marker}")
for marker in ["ensureCareerRelations", "makeCareerPromise", "resolveCareerRelationsAfterMatch"]:
    require(marker in relations and marker in app_js, f"Relações de carreira Fase 11 incompletas: {marker}")
for marker in ["ensureTacticalRoles", "roleEffects", "rolesForPosition"]:
    require(marker in tactical_roles and marker in app_js, f"Funções táticas Fase 11 incompletas: {marker}")
for marker in ["buildDomesticCupPath", "buildContinentalPath", "tieOutcome", "groupProgress"]:
    require(marker in competition_formats and marker in app_js, f"Formatos de competição Fase 12 incompletos: {marker}")
for marker in ["ensureMarketIntelligence", "marketNegotiationProfile", "scoutInvestment", "applyContractMatchBonuses"]:
    require(marker in market_intelligence and marker in app_js, f"Mercado profissional Fase 12 incompleto: {marker}")
for marker in ["buildWorldTournaments", "simulateWorldTournamentWeek", "deriveWorldQualifications", "clubWorldQualification"]:
    require(marker in world_tournaments, f"Chaves mundiais Fase 13 incompletas: {marker}")
for marker in ["simulateWorldTournamentWeek", "deriveWorldQualifications", "clubWorldQualification", "renderWorldTournaments"]:
    require(marker in app_js, f"Integração das chaves mundiais Fase 13 incompleta: {marker}")
for marker in ["ensureNationalCareer", "nationalSelectionRanking", "observeNationalRegion", "recordNationalTournament"]:
    require(marker in national_career and marker in app_js, f"Seleções por desempenho Fase 13 incompletas: {marker}")
for marker in ["regulationForLeague", "fixtureDates", "resolveRelegationTable", "REGULATION_ENGINE_VERSION"]:
    require(marker in regulations, f"Regulamentos Fase 14 incompletos: {marker}")
for marker in ["brasileirao-a", "brasileirao-b", "promotionPlayoffLegs", "regularEnd"]:
    require(marker in regulations, f"Calendário brasileiro Fase 16 incompleto: {marker}")
for marker in ["brazil-cup-2026", "Copa do Brasil 2026", "brazilCupDates"]:
    require(marker in competition_formats, f"Copa do Brasil Fase 16 incompleta: {marker}")
for marker in ["careerStartDate", "scheduleBrazilAccessPlayoff", "promotion-playoff"]:
    require(marker in app_js, f"Integração brasileira Fase 16 incompleta: {marker}")
for marker in ["ensureRivalCareer", "simulateRivalMarketWeek", "settleRivalSeason", "RIVAL_CAREER_VERSION"]:
    require(marker in rival_career and marker in app_js, f"Mercado rival Fase 14 incompleto: {marker}")
for marker in ["transferCompetition", "recordRivalTransfer"]:
    require(marker in rival_career and marker in app_js, f"Concorrência de mercado Fase 17 incompleta: {marker}")
require("transferWindow" in rival_career, "Janela de mercado Fase 17 incompleta")
for marker in ["contractRisk", "refreshMarketPressure"]:
    require(marker in market_intelligence and marker in app_js, f"Pressão contratual Fase 17 incompleta: {marker}")
for marker in ["renderMarketPressure", "transfer-rival-interest", "market-pressure-panel"]:
    require(marker in app_js or marker in premium_css, f"Interface de mercado Fase 17 incompleta: {marker}")
for marker in ["registerRivalPlayers", "rivalMarketCandidates", "recordUserTransfer", "contractEvents", "managerChanges"]:
    require(marker in rival_career and marker in app_js, f"Elencos rivais Fase 18 incompletos: {marker}")
require((ROOT / "loja.html").is_file(), "Página de loja Fase 12 ausente")
for facility in ["stadium", "training", "youth", "medical", "scouting", "commercial"]:
    image = ROOT / f"assets/facilities/{facility}.jpg"
    require(image.is_file() and 50_000 < image.stat().st_size < 400_000, f"Imagem otimizada da instalação ausente: {facility}")
for marker in ["calculatePositionRating", "selectBestLineup", "advanceRosterDays", "applyMatchConsequences", "applyTrainingWeek", "processSeasonAging"]:
    require(marker in performance_v3, f"Motor de carreira Fase 7 incompleto: {marker}")

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
    "nationalIdentityFlags": stats.get("nationalIdentityFlags", 0),
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
        "league rule status", "manifest adaptive orientation", "index references", "service-worker shell references",
        "manager face atlas", "national identity flags", "live match tactics", "match engine v2", "phase 6 tactical portraits", "phase 6 navigation identity", "phase 7 positional ratings", "phase 7 injury and recovery", "phase 7 development and aging", "phase 8 economy and construction", "phase 9 manager career", "phase 9 facility imagery", "unified club and national calendar", "continental and national tables", "trophy room and career XP", "global simulation", "rating disclosure",
    ],
}

(ROOT / "QA-WORLD-V16.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False))
