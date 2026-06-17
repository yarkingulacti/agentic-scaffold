#!/usr/bin/env python3
"""Search local SQLite Markdown memory."""

from __future__ import annotations

import argparse

from memory_common import (
    add_db_argument,
    connect,
    cosine,
    embedding,
    init_schema,
    parse_vector,
    serialize_vector,
)


def sqlite_vec_search(conn, query: str, limit: int) -> list[tuple[float, str, str, str]]:
    rows = conn.execute(
        """
        select v.distance, c.path, c.heading, c.content
        from chunk_vec v
        join chunks c on c.id = v.rowid
        where v.embedding match ? and k = ?
        order by v.distance
        """,
        (serialize_vector(embedding(query)), limit),
    ).fetchall()
    return [(1.0 / (1.0 + row[0]), row[1], row[2], row[3]) for row in rows]


def vector_search(conn, query: str, limit: int) -> list[tuple[float, str, str, str]]:
    q = embedding(query)
    rows = conn.execute("select path, heading, content, embedding from chunks").fetchall()
    scored = [(cosine(q, parse_vector(row[3])), row[0], row[1], row[2]) for row in rows]
    scored.sort(reverse=True, key=lambda item: item[0])
    return scored[:limit]


def fts_search(conn, query: str, limit: int) -> list[tuple[float, str, str, str]]:
    safe_query = " OR ".join(token for token in query.replace('"', " ").split() if token)
    if not safe_query:
        return []
    rows = conn.execute(
        """
        select bm25(chunks_fts) as score, path, heading, content
        from chunks_fts
        where chunks_fts match ?
        order by score
        limit ?
        """,
        (safe_query, limit),
    ).fetchall()
    return [(-row[0], row[1], row[2], row[3]) for row in rows]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("query")
    parser.add_argument("-k", "--limit", type=int, default=8)
    add_db_argument(parser)
    args = parser.parse_args()

    conn = connect(args.db)
    has_vec = init_schema(conn)
    results = sqlite_vec_search(conn, args.query, args.limit) if has_vec else []
    if not results:
        results = vector_search(conn, args.query, args.limit)
    if not results:
        results = fts_search(conn, args.query, args.limit)

    for score, path, heading, content in results:
        preview = " ".join(content.split())[:240]
        print(f"{score:.3f}\t{path}\t{heading}\n  {preview}\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
