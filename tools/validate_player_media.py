import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "data" / "player-media-manifest.json"
ROSTERS = ROOT / "data" / "rosters"


def require(condition, message):
    if not condition:
        raise AssertionError(message)


manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
records = manifest.get("players", [])
aliases = manifest.get("aliases", {})
ids = [str(item.get("id", "")) for item in records]
require(len(ids) == len(set(ids)), "Há jogadores duplicados no manifesto")

known_ids = set()
for path in ROSTERS.rglob("*.json"):
    document = json.loads(path.read_text(encoding="utf-8"))
    for player in document.get("players", []):
        if player.get("id"):
            known_ids.add(str(player["id"]))

for item in records:
    player_id = str(item.get("id", ""))
    license_data = item.get("license") or {}
    require(player_id in known_ids, f"Jogador desconhecido: {player_id}")
    require(license_data.get("commercialUse") is True, f"Licença comercial ausente: {player_id}")
    require(license_data.get("name") and license_data.get("reference"), f"Licença sem rastreabilidade: {player_id}")
    require(item.get("credit"), f"Crédito ausente: {player_id}")
    require(str(item.get("commonsTitle", "")).startswith("File:"), f"Título Commons ausente: {player_id}")
    require(int(item.get("width", 0)) >= 256 and int(item.get("height", 0)) >= 256, f"Imagem pequena: {player_id}")
    require(re.fullmatch(r"[a-fA-F0-9]{40}", str(item.get("sha1", ""))), f"SHA-1 Wikimedia inválido: {player_id}")
    require(str(item.get("commonsPage", "")).startswith("https://commons.wikimedia.org/"), f"Página Commons ausente: {player_id}")

for alias_id, target_id in aliases.items():
    require(str(alias_id) in known_ids, f"Alias desconhecido: {alias_id}")
    require(str(target_id) in ids, f"Destino de alias ausente: {alias_id} -> {target_id}")

report = {
    "status": "approved" if records else "ready-awaiting-licensed-assets",
    "licensedPlayers": len(records) + len(aliases),
    "uniqueCommonsPhotos": len(records),
    "uniqueRosterPlayers": len(known_ids),
    "duplicateMediaRecords": len(ids) - len(set(ids)),
    "commerciallyTraceable": all((item.get("license") or {}).get("commercialUse") is True for item in records),
}
print(json.dumps(report, ensure_ascii=False))
