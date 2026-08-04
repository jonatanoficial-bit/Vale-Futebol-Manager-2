"""Reconcile generic club references with already bundled crest files.

Only exact, unique slug matches are accepted. The script never guesses between
multiple candidates and never labels generated artwork as an official crest.
"""
from __future__ import annotations

import argparse
import json
import re
import unicodedata
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "data" / "world-catalog-2026.json"


def slug(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", normalized.lower()).strip("-")


def candidate_key(path: Path) -> str:
    if path.name.lower() in {"badge.png", "logo.png", "badge.webp", "logo.webp"}:
        return slug(path.parent.name)
    return slug(path.stem)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true")
    args = parser.parse_args()

    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    referenced = {club.get("badge", "") for club in catalog["clubs"]}
    index: dict[str, list[Path]] = defaultdict(list)
    for path in (ROOT / "assets" / "clubs").rglob("*"):
        if path.is_file() and path.suffix.lower() in {".png", ".webp", ".svg"}:
            relative = path.relative_to(ROOT).as_posix()
            if relative not in referenced:
                index[candidate_key(path)].append(path)

    changes = []
    for club in catalog["clubs"]:
        current = club.get("badge", "")
        if "generic" not in current and "placeholder" not in current:
            continue
        keys = {slug(club.get("id", "")), slug(club.get("name", ""))}
        country_key = slug(club.get("countryId", club.get("country", "")))
        candidates = {
            path for key in keys for path in index.get(key, [])
            if country_key in {slug(part) for part in path.parts}
        }
        if len(candidates) != 1:
            continue
        chosen = next(iter(candidates)).relative_to(ROOT).as_posix()
        club["badge"] = chosen
        club["logo"] = chosen
        changes.append({"club": club["name"], "league": club["leagueId"], "badge": chosen})

    if args.apply and changes:
        generic = sum("generic" in club.get("badge", "") or "placeholder" in club.get("badge", "") for club in catalog["clubs"])
        catalog["stats"]["realBadgeFiles"] = len(catalog["clubs"]) - generic
        CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"mode": "apply" if args.apply else "dry-run", "matches": len(changes), "changes": changes}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
