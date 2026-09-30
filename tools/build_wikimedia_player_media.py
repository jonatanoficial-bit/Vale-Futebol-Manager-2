"""Build the VFM player-photo manifest from Wikidata and Wikimedia Commons.

The roster importer uses Transfermarkt numeric identifiers prefixed with ``tm-``.
Wikidata property P2446 stores the same identifier, while P18 points at a
Wikimedia Commons image.  This script joins those identifiers, validates the
Commons license metadata and writes only reusable photos to the game manifest.

No Transfermarkt image is downloaded or displayed by this pipeline.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ROSTERS = ROOT / "data" / "rosters"
MANIFEST = ROOT / "data" / "player-media-manifest.json"
REPORT = ROOT / "PLAYER-MEDIA-REPORT.json"
CACHE_DIR = ROOT / ".cache" / "player-media"
WIKIDATA_ENDPOINT = "https://query.wikidata.org/sparql"
COMMONS_ENDPOINT = "https://commons.wikimedia.org/w/api.php"
USER_AGENT = "ValeFutebolManager/16.2 (player media catalog; Wikimedia APIs)"


def normalize_name(value: str) -> str:
    value = unicodedata.normalize("NFKD", value or "")
    value = "".join(ch for ch in value if not unicodedata.combining(ch))
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def plain_text(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", html.unescape(value or ""))
    return re.sub(r"\s+", " ", value).strip()


def request_json(url: str, data: dict[str, str] | None = None, attempts: int = 5):
    body = urllib.parse.urlencode(data).encode("utf-8") if data else None
    request = urllib.request.Request(
        url,
        data=body,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(request, timeout=75) as response:
                return json.load(response)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            if attempt == attempts - 1:
                raise RuntimeError(f"Falha em {url}: {exc}") from exc
            retry_after = 0
            if isinstance(exc, urllib.error.HTTPError) and exc.code == 429:
                try:
                    retry_after = int(exc.headers.get("Retry-After", "0"))
                except ValueError:
                    retry_after = 0
            time.sleep(max(retry_after, 5 * (attempt + 1)))


def read_players():
    players: dict[str, dict] = {}
    for path in ROSTERS.rglob("*.json"):
        try:
            document = json.loads(path.read_text(encoding="utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            continue
        for item in document.get("players", []):
            player_id = str(item.get("id", "")).strip()
            if not player_id:
                continue
            current = players.setdefault(
                player_id,
                {
                    "id": player_id,
                    "names": set(),
                    "files": set(),
                },
            )
            name = str(item.get("displayName") or item.get("name") or "").strip()
            if name:
                current["names"].add(name)
            current["files"].add(path.relative_to(ROOT).as_posix())
    return players


def wikidata_images(tm_ids: list[str], batch_size: int, limit: int | None):
    selected = tm_ids[:limit] if limit else tm_ids
    found: dict[str, dict] = {}
    for offset in range(0, len(selected), batch_size):
        batch = selected[offset : offset + batch_size]
        values = " ".join(json.dumps(value) for value in batch)
        query = f"""
          SELECT ?tm ?item ?image WHERE {{
            VALUES ?tm {{ {values} }}
            ?item wdt:P2446 ?tm; wdt:P18 ?image.
          }}
        """
        payload = request_json(WIKIDATA_ENDPOINT, {"query": query, "format": "json"})
        for binding in payload.get("results", {}).get("bindings", []):
            tm_id = binding.get("tm", {}).get("value", "")
            image_url = binding.get("image", {}).get("value", "")
            entity = binding.get("item", {}).get("value", "").rsplit("/", 1)[-1]
            if not tm_id or not image_url:
                continue
            filename = urllib.parse.unquote(image_url.rsplit("/", 1)[-1])
            candidate = {"wikidataId": entity, "filename": filename}
            # P18 can contain multiple values. A stable filename keeps rebuilds stable.
            if tm_id not in found or filename.casefold() < found[tm_id]["filename"].casefold():
                found[tm_id] = candidate
        done = min(offset + batch_size, len(selected))
        print(f"Wikidata: {done}/{len(selected)} IDs, {len(found)} imagens", flush=True)
        time.sleep(0.15)
    return found


def reusable_license(short_name: str) -> bool:
    value = (short_name or "").strip().lower()
    if value in {"cc0", "cc0 1.0", "public domain", "public domain mark"}:
        return True
    return bool(re.fullmatch(r"cc by(?:-sa)? [1-4](?:\.0)?(?: [a-z]{2})?", value))


def commons_metadata(candidates: dict[str, dict], batch_size: int = 50):
    filename_to_tm: dict[str, list[str]] = defaultdict(list)
    for tm_id, candidate in candidates.items():
        filename_to_tm[candidate["filename"]].append(tm_id)
    filenames = sorted(filename_to_tm, key=str.casefold)
    progress_path = CACHE_DIR / "commons-progress.json"
    approved: dict[str, dict] = {}
    rejected = defaultdict(int)
    processed: set[str] = set()
    if progress_path.exists():
        progress = json.loads(progress_path.read_text(encoding="utf-8"))
        if progress.get("candidateCount") == len(candidates):
            approved.update(progress.get("approved", {}))
            rejected.update(progress.get("rejected", {}))
            processed.update(progress.get("processed", []))
            print(f"Commons: retomando {len(processed)}/{len(filenames)} arquivos do cache", flush=True)

    def save_progress():
        progress_path.write_text(
            json.dumps(
                {
                    "candidateCount": len(candidates),
                    "approved": approved,
                    "rejected": dict(rejected),
                    "processed": sorted(processed, key=str.casefold),
                },
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )

    remaining = [filename for filename in filenames if filename not in processed]
    batches = [remaining[offset : offset + batch_size] for offset in range(0, len(remaining), batch_size)]

    def fetch_batch(batch):
        params = {
            "action": "query",
            "format": "json",
            "formatversion": "2",
            "prop": "imageinfo",
            "iiprop": "url|size|sha1|extmetadata",
            "iiurlwidth": "512",
            "titles": "|".join(f"File:{name}" for name in batch),
        }
        return request_json(COMMONS_ENDPOINT, params)

    # Two polite concurrent readers keep a full rebuild practical without
    # pressuring the public Wikimedia API.
    with ThreadPoolExecutor(max_workers=2) as executor:
      for batch_index, payload in enumerate(executor.map(fetch_batch, batches), start=1):
        current_batch = batches[batch_index - 1]
        for page in payload.get("query", {}).get("pages", []):
            title = page.get("title", "")
            filename = title[5:] if title.startswith("File:") else title
            info = (page.get("imageinfo") or [{}])[0]
            metadata = info.get("extmetadata") or {}
            license_name = str((metadata.get("LicenseShortName") or {}).get("value", "")).strip()
            if not info.get("thumburl"):
                rejected["missingImage"] += len(filename_to_tm.get(filename, []))
                continue
            if not reusable_license(license_name):
                rejected[f"license:{license_name or 'missing'}"] += len(filename_to_tm.get(filename, []))
                continue
            license_url = str((metadata.get("LicenseUrl") or {}).get("value", "")).strip()
            artist = plain_text(str((metadata.get("Attribution") or {}).get("value", "")))
            if not artist:
                artist = plain_text(str((metadata.get("Artist") or {}).get("value", "")))
            if not artist:
                rejected["missingCredit"] += len(filename_to_tm.get(filename, []))
                continue
            common = {
                "src": info["thumburl"],
                "src96": info["thumburl"],
                "width": int(info.get("thumbwidth") or 0),
                "height": int(info.get("thumbheight") or 0),
                "sha1": str(info.get("sha1") or ""),
                "credit": artist,
                "commonsTitle": title,
                "commonsPage": info.get("descriptionurl", ""),
                "restrictions": plain_text(str((metadata.get("Restrictions") or {}).get("value", ""))),
                "license": {
                    "name": license_name,
                    "reference": license_url or info.get("descriptionurl", ""),
                    "commercialUse": True,
                    "shareAlike": "BY-SA" in license_name.upper(),
                    "expiresAt": None,
                },
            }
            for tm_id in filename_to_tm.get(filename, []):
                approved[tm_id] = {**common, **candidates[tm_id]}
        processed.update(current_batch)
        save_progress()
        done = min(len(processed), len(filenames))
        print(f"Commons: {done}/{len(filenames)} arquivos, {len(approved)} aprovados", flush=True)
    return approved, dict(sorted(rejected.items()))


def build_aliases(players: dict[str, dict], approved: dict[str, dict]):
    names_to_tm: dict[str, set[str]] = defaultdict(set)
    for player_id, player in players.items():
        match = re.fullmatch(r"tm-(\d+)", player_id)
        if not match:
            continue
        for name in player["names"]:
            normalized = normalize_name(name)
            if normalized:
                names_to_tm[normalized].add(match.group(1))

    aliases: dict[str, str] = {}
    for player_id, player in players.items():
        if re.fullmatch(r"tm-\d+", player_id):
            continue
        matches = set()
        for name in player["names"]:
            matches.update(names_to_tm.get(normalize_name(name), set()))
        if len(matches) == 1:
            tm_id = next(iter(matches))
            if tm_id in approved:
                aliases[player_id] = tm_id
    return aliases


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--batch-size", type=int, default=180)
    parser.add_argument("--limit", type=int, help="Process only the first N Transfermarkt IDs")
    args = parser.parse_args()

    players = read_players()
    tm_ids = sorted(
        {match.group(1) for player_id in players if (match := re.fullmatch(r"tm-(\d+)", player_id))},
        key=int,
    )
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    candidate_cache = CACHE_DIR / "wikidata-candidates.json"
    if not args.limit and candidate_cache.exists():
        cached = json.loads(candidate_cache.read_text(encoding="utf-8"))
        candidates = cached.get("candidates", {}) if cached.get("tmIdCount") == len(tm_ids) else {}
    else:
        candidates = {}
    if candidates:
        print(f"Wikidata: cache reutilizado, {len(candidates)} imagens", flush=True)
    else:
        candidates = wikidata_images(tm_ids, max(1, args.batch_size), args.limit)
        if not args.limit:
            candidate_cache.write_text(
                json.dumps({"tmIdCount": len(tm_ids), "candidates": candidates}, ensure_ascii=False),
                encoding="utf-8",
            )
    approved, rejected = commons_metadata(candidates)
    too_small = [tm_id for tm_id, media in approved.items() if int(media.get("width", 0)) < 256 or int(media.get("height", 0)) < 256]
    for tm_id in too_small:
        approved.pop(tm_id, None)
    if too_small:
        rejected["imageBelow256"] = rejected.get("imageBelow256", 0) + len(too_small)
    aliases = build_aliases(players, approved)

    def manifest_record(player_id: str, media: dict):
        record = {
            "id": player_id,
            "wikidataId": media["wikidataId"],
            "commonsTitle": media["commonsTitle"],
            "commonsPage": media["commonsPage"],
            "width": media["width"],
            "height": media["height"],
            "sha1": media["sha1"],
            "credit": media["credit"],
            "license": {
                "name": media["license"]["name"],
                "reference": media["license"]["reference"],
                "commercialUse": True,
            },
        }
        if media.get("restrictions"):
            record["restrictions"] = media["restrictions"]
        return record

    records = []
    for tm_id, media in approved.items():
        records.append(manifest_record(f"tm-{tm_id}", media))
    records.sort(key=lambda item: item["id"])
    alias_records = {player_id: f"tm-{tm_id}" for player_id, tm_id in sorted(aliases.items())}

    now = datetime.now(timezone.utc).isoformat(timespec="seconds")
    manifest = {
        "schema": 2,
        "generatedAt": now,
        "source": "Wikidata P2446/P18 + Wikimedia Commons imageinfo",
        "policy": {
            "reusableLicenseRequired": True,
            "allowed": ["CC0", "Public Domain", "CC BY", "CC BY-SA"],
            "remoteSourceLinksAreNotImages": True,
            "fallback": "assets/players/generic/player-generic.webp",
        },
        "players": records,
        "aliases": alias_records,
    }
    MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")

    unique_approved_tm = len(approved)
    report = {
        "generatedAt": now,
        "uniqueRosterPlayers": len(players),
        "transfermarktRosterPlayers": len(tm_ids),
        "wikidataP18Matches": len(candidates),
        "approvedCommonsPhotos": unique_approved_tm,
        "exactNameAliases": len(aliases),
        "manifestRecords": len(records),
        "realPhotoPlayerIds": len(records) + len(aliases),
        "genericFallbackPlayers": len(players) - len(records) - len(aliases),
        "rejected": rejected,
        "method": {
            "primary": "exact Transfermarkt ID: roster tm-ID = Wikidata P2446",
            "alias": "exact normalized name only when it resolves to one tm-ID in all local rosters and that ID has an approved photo",
            "fallback": "original fictional VFM portrait",
        },
    }
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
