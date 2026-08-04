from __future__ import annotations

import difflib
import json
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
catalog = json.loads((ROOT / "data/world-catalog-2026.json").read_text(encoding="utf-8"))
countries = json.loads((ROOT / "data/sources/flag-icons-main/flag-icons-main/country.json").read_text(encoding="utf-8"))


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return " ".join("".join(ch if ch.isalnum() else " " for ch in value).split())


by_name = {norm(item["name"]): item for item in countries}
names = list(by_name)
rows = []
for team in catalog["nationalTeams"]:
    key = norm(team["name"])
    if key in by_name:
        item, score = by_name[key], 1.0
    else:
        match = difflib.get_close_matches(key, names, n=1, cutoff=0)
        item = by_name[match[0]]
        score = difflib.SequenceMatcher(None, key, match[0]).ratio()
    if score < 0.86:
        rows.append({"team": team["name"], "fifa": team["code"], "candidate": item["name"], "iso2": item["code"], "score": round(score, 3)})

print(json.dumps(rows, ensure_ascii=False, indent=2))
print(f"low-confidence={len(rows)} total={len(catalog['nationalTeams'])}")
