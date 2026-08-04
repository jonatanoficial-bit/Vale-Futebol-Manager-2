from __future__ import annotations

import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "SHA256SUMS.txt"

lines = []
for path in sorted(ROOT.rglob("*"), key=lambda item: item.as_posix().lower()):
    if not path.is_file() or path == OUTPUT:
        continue
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    lines.append(f"{digest.hexdigest()}  {path.relative_to(ROOT).as_posix()}")

OUTPUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"SHA-256 manifest: {len(lines)} files")
