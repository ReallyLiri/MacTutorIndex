# Claude Instructions

## CRITICAL: NO COMMENTS

- **NEVER ADD COMMENTS TO CODE - THIS IS A STRICT REQUIREMENT**
- **DO NOT ADD DOCSTRINGS UNDER ANY CIRCUMSTANCES**
- **DO NOT EXPLAIN CODE FUNCTIONALITY IN COMMENTS**
- **NO INLINE EXPLANATIONS**
- **ABSOLUTELY NO DOCUMENTATION WITHIN CODE FILES**
- **NEVER USE COMMENTS TO SUMMARIZE WHAT CODE DOES**

Code must be absolutely free of explanatory text or documentation.
Keep all code as minimal as possible with zero comments.

## Testing and Linting

- Before completing a task, run any available tests
- For Python code, run the following linting tools:
  - `uv run -m black <file>` to format the code
  - `uv run -m flake8 <file>` to check for code quality issues

## Workflow Tools

- Use `uv` commands to run Python scripts and manage dependencies
  - `uv add <package>` to add dependencies
  - `uv run <script>` to run Python scripts

## File Organization

- crawler/ - Code for fetching biographies from MacTutor
- parser/ - Code for extracting structured data from biographies
- store/ - Storage for downloaded and processed data

## Environment Variables

- `OPENAI_API_KEY` - For OpenAI API access
- `ANTHROPIC_API_KEY` - For Anthropic API access
- `WORKER_COUNT` - Number of worker processes for parallel tasks (defaults to CPU count - 1 for crawler, min(CPU count - 1, 4) for parser)