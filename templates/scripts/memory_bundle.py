#!/usr/bin/env python3
"""Write a focused Markdown bundle from local memory search results."""

from __future__ import annotations

import argparse
from pathlib import Path

from memory_common import ROOT, add_db_argument, connect, init_schema
from memory_search import sqlite_vec_search, vector_search


def query_text(raw: str) -> str:
    path = ROOT / raw
    if path.exists() and path.is_file():
        return path.read_text(encoding="utf-8")
    return raw


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("query_or_path")
    parser.add_argument("-k", "--limit", type=int, default=8)
    parser.add_argument("-o", "--output", type=Path, default=ROOT / ".memory" / "context.bundle.md")
    add_db_argument(parser)
    args = parser.parse_args()

    conn = connect(args.db)
    has_vec = init_schema(conn)
    query = query_text(args.query_or_path)
    results = sqlite_vec_search(conn, query, args.limit) if has_vec else []
    if not results:
        results = vector_search(conn, query, args.limit)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as handle:
        handle.write(f"# Context Bundle\n\nQuery: `{args.query_or_path}`\n\n")
        for score, path, heading, content in results:
            handle.write(f"## {path} - {heading}\n\n")
            handle.write(f"Score: {score:.3f}\n\n")
            handle.write(content.strip())
            handle.write("\n\n")
    print(f"wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
