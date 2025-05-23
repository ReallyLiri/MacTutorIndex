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
- For Python code, ONLY run the following linting tools WHEN EXPLICITLY REQUESTED:
  - `uv run -m black <file>` to format the code
  - `uv run -m flake8 <file>` to check for code quality issues
- NEVER run formatting or linting tools automatically
- DO NOT apply automatic code formatting unless specifically asked
- NEVER make whitespace-only changes to code
- DO NOT attempt to fix style issues or spacing issues unless explicitly asked
- PRESERVE all existing whitespace patterns in edited files

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
- `FIREBASE_TYPE` - Firebase service account type
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY_ID` - Firebase private key ID
- `FIREBASE_PRIVATE_KEY` - Firebase private key (with escaped newlines as \n)
- `FIREBASE_CLIENT_EMAIL` - Firebase client email
- `FIREBASE_CLIENT_ID` - Firebase client ID
- `FIREBASE_CLIENT_X509_CERT_URL` - Firebase client x509 certificate URL