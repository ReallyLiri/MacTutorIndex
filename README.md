# MacTutor Index Project

Tools to crawl, parse, and index the MacTutor History of Mathematics Archive.

## Setup

```bash
uv sync
```

## Components

- **crawler**: Fetches biographies from the MacTutor website and saves them as markdown files
- **parser**: Extracts structured data from the biography markdown files

## Usage

### Crawler

The crawler fetches mathematician biographies from the MacTutor website and saves them as markdown files.

```bash
# Run with default settings (all letters, optimal number of processes)
uv run crawler/crawler.py

# Control the number of worker processes using an environment variable
WORKER_COUNT=4 uv run crawler/crawler.py
```

### Parser

The parser extracts structured data from the biography markdown files.

```bash
# Run the level 1 parser to extract basic biographical data
uv run parser/parser.py

# Run the level 2 parser to extract additional data using AI assistance
uv run parser/parser-l2.py

# Control the number of parser worker processes
WORKER_COUNT=2 uv run parser/parser-l2.py
```

Make sure to have `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` set in order to use the level 2 parser.
