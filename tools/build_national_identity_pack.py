from __future__ import annotations

import difflib
import json
import shutil
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACK = ROOT / "data/sources/flag-icons-main/flag-icons-main"
OUTPUT = ROOT / "assets/national/flags"
CATALOG_PATH = ROOT / "data/world-catalog-2026.json"
FIFA_PATH = ROOT / "data/fifa-associations-2026.json"

MANUAL = {
    "British Virgin Islands": "vg",
    "China PR": "cn",
    "Chinese Taipei": "tw",
    "Congo": "cg",
    "Congo DR": "cd",
    "Czechia": "cz",
    "DPR Korea": "kp",
    "Hong Kong, China": "hk",
    "IR Iran": "ir",
    "Korea Republic": "kr",
    "Kyrgyz Republic": "kg",
    "Palestine": "ps",
    "Republic of Ireland": "ie",
    "St Lucia": "lc",
    "Tahiti": "pf",
    "The Gambia": "gm",
    "US Virgin Islands": "vi",
    "USA": "us",
}


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def norm(value: str) -> str:
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return " ".join("".join(ch if ch.isalnum() else " " for ch in value).split())


countries = read_json(PACK / "country.json")
by_name = {norm(item["name"]): item["code"] for item in countries}
names = list(by_name)
catalog = read_json(CATALOG_PATH)
fifa = read_json(FIFA_PATH)
OUTPUT.mkdir(parents=True, exist_ok=True)

mapping = {}
for team in catalog["nationalTeams"]:
    if team["name"] in MANUAL:
        iso2 = MANUAL[team["name"]]
    else:
        key = norm(team["name"])
        if key in by_name:
            iso2 = by_name[key]
        else:
            match = difflib.get_close_matches(key, names, n=1, cutoff=0.86)
            if not match:
                raise RuntimeError(f"No safe flag match for {team['name']}")
            iso2 = by_name[match[0]]
    source = PACK / "flags/1x1" / f"{iso2}.svg"
    if not source.is_file():
        raise RuntimeError(f"Missing SVG for {team['name']}: {iso2}")
    target = OUTPUT / f"{team['code'].lower()}.svg"
    shutil.copyfile(source, target)
    badge = f"assets/national/flags/{team['code'].lower()}.svg"
    team["badge"] = badge
    team["visualIdentity"] = "national-flag"
    team["flagIso2"] = iso2
    mapping[team["code"]] = {"name": team["name"], "iso2": iso2, "badge": badge}

for team in fifa["associations"]:
    match = mapping[team["code"]]
    team["badge"] = match["badge"]
    team["visualIdentity"] = "national-flag"
    team["flagIso2"] = match["iso2"]

catalog["stats"]["nationalIdentityFlags"] = len(mapping)
CATALOG_PATH.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
FIFA_PATH.write_text(json.dumps(fifa, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
(ROOT / "data/national-identity-map.json").write_text(json.dumps(mapping, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
shutil.copyfile(PACK / "LICENSE", ROOT / "assets/national/LICENSE-flag-icons-MIT.txt")
print(json.dumps({"nationalTeams": len(mapping), "genericBadges": 0, "license": "MIT flag-icons"}, ensure_ascii=False))
