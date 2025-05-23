import concurrent.futures
import json
import os
from concurrent.futures import ProcessPoolExecutor

from tqdm import tqdm

from utils.llm import query_llm
from utils.workers import get_worker_count

MD_INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/md")
L1_INPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l1")
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "store/json/l2")

WORKERS = get_worker_count(max_workers=4)

FORCE_RUN = os.environ.get("FORCE_RUN", "").lower() in ("1", "true", "yes")

os.makedirs(OUTPUT_DIR, exist_ok=True)


def extract_biography_data(text, l1_data):
    bio_prompt = """Given the markdown-formatted biography text, extract the following structured JSON fields:
- lived_in: list of places they lived at (array of strings)
- worked_in: list of places they worked at (array of strings)
- religions: specify any religions mentioned (array of strings, or null if none)
- profession: list of professions (array of strings)
- institution_affiliation: list of affiliations (array of strings)

Return ONLY a JSON object with those fields, ensure it's valid JSON without comments."""

    l2_data = query_llm(text, bio_prompt, max_tokens=2000)
    if not l2_data:
        return None

    result_data = l1_data.copy()
    result_data.update(l2_data)

    connections_prompt = f"""Given the markdown-formatted biography text, and the following connections:
[{", ".join(l1_data["connections"])}]
find for each connection the relationship type (e.g., "student of", "influenced by", "collaborator with").

Extract the following structured JSON fields:
- connections: list of objects with fields:
    - person: name of a connected person
    - connection_type: relationship (e.g., "student of", "influenced by", "collaborator with")

Return ONLY a valid JSON object with those fields, ensure it's proper JSON format."""

    connections_data = query_llm(text, connections_prompt, max_tokens=5000)
    if not connections_data:
        return None
    result_data.update(connections_data)

    return json.dumps(result_data, indent=4, ensure_ascii=False)


def process_file(filename):
    try:
        if not filename.endswith(".md"):
            return False, filename, "Not a markdown file"

        l1_file = filename.replace(".md", ".json")
        l1_path = os.path.join(L1_INPUT_DIR, l1_file)
        output_path = os.path.join(OUTPUT_DIR, l1_file)

        if not os.path.exists(l1_path):
            return False, filename, f"L1 data not found: {l1_file}"

        if os.path.exists(output_path) and not FORCE_RUN:
            with open(output_path, "r") as f:
                existing_data = json.loads(f.read())
            if (
                "connections" in existing_data
                and isinstance(existing_data["connections"], list)
                and all(isinstance(conn, dict) for conn in existing_data["connections"])
            ):
                return True, filename, "Skipped (already exists)"

        with open(os.path.join(MD_INPUT_DIR, filename), "r", encoding="utf-8") as f:
            markdown_text = f.read()

        with open(l1_path, "r", encoding="utf-8") as f:
            l1_json_text = f.read()

        result = extract_biography_data(markdown_text, json.loads(l1_json_text))

        if not result:
            return False, filename, "failed"

        with open(output_path, "w", encoding="utf-8") as f:
            f.write(result)

        return True, filename, None
    except Exception as ex:
        return False, filename, f"Error: {str(ex)}"


def parse_biographies(filenames=None):
    if filenames is None or filenames == []:
        filenames = []
        for file in os.listdir(L1_INPUT_DIR):
            if file.endswith(".json"):
                md_file = file.replace(".json", ".md")
                if os.path.exists(os.path.join(MD_INPUT_DIR, md_file)):
                    filenames.append(md_file)

    print(f"Processing {len(filenames)} biographies with {WORKERS} workers")

    success_count = 0
    error_count = 0

    with ProcessPoolExecutor(max_workers=WORKERS) as executor:
        with tqdm(total=len(filenames), desc="Processing biographies") as pbar:
            future_to_file = {executor.submit(process_file, filename): filename for filename in filenames}

            for future in concurrent.futures.as_completed(future_to_file):
                filename = future_to_file[future]
                try:
                    success, file, error = future.result()
                    if success:
                        success_count += 1
                    else:
                        error_count += 1
                        print(f"\nError processing {file}: {error}")
                except Exception as exc:
                    error_count += 1
                    print(f"\nException processing {filename}: {exc}")

                pbar.update(1)

    print(f"Completed: {success_count} succeeded, {error_count} failed")
    return success_count, error_count


if __name__ == "__main__":
    parse_biographies()
