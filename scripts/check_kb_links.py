#!/usr/bin/env python3
"""Check local Markdown links in the personal knowledge base."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SCAN_ROOTS = [
    ROOT / "README.md",
    ROOT / "AGENTS.md",
    ROOT / "wiki",
    ROOT / "raw",
    ROOT / "inbox",
]
LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")


def markdown_files() -> list[Path]:
    files: list[Path] = []
    for root in SCAN_ROOTS:
        if root.is_file() and root.suffix == ".md":
            files.append(root)
        elif root.is_dir():
            files.extend(sorted(root.rglob("*.md")))
    return sorted(files)


def is_external(target: str) -> bool:
    return (
        target.startswith("http://")
        or target.startswith("https://")
        or target.startswith("mailto:")
        or target.startswith("#")
    )


def strip_fragment(target: str) -> str:
    return target.split("#", 1)[0]


def main() -> int:
    missing: list[str] = []

    for path in markdown_files():
        text = path.read_text(encoding="utf-8")
        for match in LINK_RE.finditer(text):
            raw_target = match.group(1).strip()
            if is_external(raw_target):
                continue
            target = strip_fragment(raw_target)
            if not target:
                continue
            resolved = (path.parent / target).resolve()
            if not resolved.exists():
                rel_path = path.relative_to(ROOT)
                missing.append(f"{rel_path}: missing link target {raw_target}")

    if missing:
        print("Broken local Markdown links:")
        for item in missing:
            print(f"- {item}")
        return 1

    print("All local Markdown links resolve.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

