from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG_PATH = ROOT / "data/world-catalog-2026.json"
REPORT_PATH = ROOT / "IMPORT-CC0-REPORT.json"

# The legacy V10 catalog carried 2025 Série A entries alongside the imported
# 2026 competition. CBF confirms these four clubs compete in Série B in 2026;
# four additional legacy aliases duplicated imported current club records.
REMOVE_FROM_SERIE_A = {
    "Bahia",
    "Ceará",
    "Corinthians",
    "Fortaleza",
    "Grêmio",
    "Juventude",
    "Sport Recife",
    "Vasco da Gama SAF",
}


def load_json(path: Path):
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


catalog = load_json(CATALOG_PATH)
before = len(catalog["clubs"])
catalog["clubs"] = [
    club
    for club in catalog["clubs"]
    if not (club.get("leagueId") == "brasileirao-a" and club.get("name") in REMOVE_FROM_SERIE_A)
]

# Nacional of Paraguay and Nacional of Uruguay are different clubs and need
# stable independent IDs throughout saves, tables, transfers and job offers.
for club in catalog["clubs"]:
    if club.get("leagueId") == "paraguay-primera" and club.get("id") == "nacional":
        club["id"] = "nacional-paraguay"

club_players = 0
for club in catalog["clubs"]:
    roster_path = club.get("rosterPath")
    if roster_path:
        club_players += len(load_json(ROOT / roster_path).get("players", []))

stats = catalog["stats"]
stats["simulationClubs"] = len(catalog["clubs"])
stats["playableClubs"] = sum(bool(club.get("rosterPath")) for club in catalog["clubs"])
stats["clubPlayers"] = club_players
stats["realBadgeFiles"] = sum(
    "placeholder" not in club.get("badge", "") and "generic" not in club.get("badge", "")
    for club in catalog["clubs"]
)

serie_a = [club for club in catalog["clubs"] if club.get("leagueId") == "brasileirao-a"]
serie_b = [club for club in catalog["clubs"] if club.get("leagueId") == "brasileirao-b"]
if len(serie_a) != 20 or len(serie_b) != 20:
    raise RuntimeError(f"Brazil 2026 division membership invalid: Série A={len(serie_a)}, Série B={len(serie_b)}")

CATALOG_PATH.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

report = load_json(REPORT_PATH)
report.update(
    {
        "finalNormalizedClubs": len(catalog["clubs"]),
        "finalPlayableClubs": stats["playableClubs"],
        "finalClubPlayers": stats["clubPlayers"],
        "removedLegacyBrazilAliases": before - len(catalog["clubs"]),
        "brazilSerieAClubs": len(serie_a),
        "brazilSerieBClubs": len(serie_b),
    }
)
REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(json.dumps(report, ensure_ascii=False))
