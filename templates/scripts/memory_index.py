#!/usr/bin/env python3
"""Index project Markdown into local SQLite memory."""

from __future__ import annotations

import argparse

from memory_common import (
    add_db_argument,
    connect,
    content_hash,
    embedding,
    init_schema,
    markdown_files,
    rel,
    serialize_vector,
    split_markdown,
)


def main() -> int:
    parser = argparse.ArgumentParser()
    add_db_argument(parser)
    args = parser.parse_args()

    conn = connect(args.db)
    has_vec = init_schema(conn)
    conn.executescript(
        """
        delete from chunks_fts;
        delete from chunks;
        """
    )
    if has_vec:
        conn.execute("delete from chunk_vec")

    files = markdown_files()
    count = 0
    for path in files:
        text = path.read_text(encoding="utf-8")
        for index, (heading, content) in enumerate(split_markdown(path, text)):
            vector = serialize_vector(embedding(f"{heading}\n{content}"))
            cur = conn.execute(
                """
                insert into chunks(path, heading, chunk_index, content, embedding, content_hash)
                values (?, ?, ?, ?, ?, ?)
                """,
                (rel(path), heading, index, content, vector, content_hash(path, index, content)),
            )
            row_id = cur.lastrowid
            conn.execute(
                "insert into chunks_fts(rowid, content, heading, path) values (?, ?, ?, ?)",
                (row_id, content, heading, rel(path)),
            )
            if has_vec:
                conn.execute("insert into chunk_vec(rowid, embedding) values (?, ?)", (row_id, vector))
            count += 1

    conn.commit()
    backend = "sqlite-vec+fts" if has_vec else "fts"
    print(f"indexed {count} chunks from {len(files)} markdown files using {backend}")
    print(f"db: {args.db}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
